import { KernelBase } from "@basthon/kernel-base";

declare global {
  interface Window {
    _basthonBypassBus?: BypassBus;
  }
}

/**
 * Non serializable data exchanger (Bus) to bypass stringifying
 * messages between frontend and kernel that prevents some sharing.
 */
class BypassBus {
  // The actual bus is a Map.
  private _bus = new Map<number, any>();

  public constructor() {}

  /**
   * Push an object to the bus and get back an id to later pop it.
   */
  public push(obj: any): number {
    let id = 0;
    for (; id < this._bus.size; id++) if (!this._bus.has(id)) break;
    this._bus.set(id, obj);
    return id;
  }

  /**
   * Remove an object from the bus from its id.
   */
  public pop(id: number): any {
    const res = this._bus.get(id);
    this._bus.delete(id);
    return res;
  }
}

/**
 * Evaluation queue (FIFO).
 */
class EvalQueue {
  private ws: BasthonWebSocket;
  private _queue: any[] = [];
  public ready: boolean = false;

  public constructor(ws: BasthonWebSocket) {
    this.ws = ws;
  }

  /**
   * Pushing an eval to the queue.
   */
  public push(data: any): any {
    this._queue.push(data);
    if (this.ready) this.popAndRun();
    return data;
  }

  /**
   * Poping an eval from the queue.
   */
  public pop(): any {
    return this._queue.shift();
  }

  /**
   * Pop data and run it.
   */
  public popAndRun(): any {
    const data = this.pop();
    if (data) {
      this.ready = false;
      this.ws._send_busy(data.parent_msg);
      this.ws._send(
        this.ws._format_msg(
          data.parent_msg,
          "execute_input",
          {
            code: data.code,
            execution_count: data.execution_cout,
          },
          "iopub",
        ),
      );
      // this should fix the output mess when running all cells
      // at a time
      window.setTimeout(async () => {
        // always wait for kernel to be ready before executing
        const kernel = this.ws.kernel;
        await kernel?.ready();
        kernel?.dispatchEvent("eval.request", data);
      }, 1);
    } else {
      this.ready = true;
    }
    return data;
  }
}

export const CLOSED = 0;
export const OPEN = 1;

/**
 * A fake interface to WebSocket to simulate communication with
 * Python kernel.
 */
export class BasthonWebSocket {
  public url: string;
  public onopen?: () => void;
  public onclose?: () => void;
  public onerror = null;
  public onmessage?: (_: any) => void;
  public readyState = OPEN;
  public message_count = 0;
  public kernel?: KernelBase;
  public eval_queue: EvalQueue;
  public bypassBus = new BypassBus();
  private _input_resolver: Function | undefined = undefined;
  private _eventHandlers = new Map<string, EventListener>();

  public constructor(url: string, basthonKernelAvailable: Promise<KernelBase>) {
    this.url = url;
    this.eval_queue = new EvalQueue(this);
    window._basthonBypassBus = this.bypassBus;
    setTimeout(() => {
      this.onopen?.();
    }, 500);
    this.buildEventHandlers();
    (async () => {
      const kernel = await basthonKernelAvailable;
      this.kernel = kernel;
      this.connectEvents();
      await this.startEvalQueue();
    })();
  }

  // Safe kernel getter
  public get kernelSafe() {
    return this.kernel?.isReady ? this.kernel : null;
  }

  // build event handler map (to later disconnect events)
  private buildEventHandlers() {
    /* send finished signal to kernel and run next eval */
    const send_finished_and_continue = (data: any) => {
      const parent = data.parent_msg;
      this._send_idle(parent);
      this._send(
        this._format_msg(
          parent,
          "execute_reply",
          {
            execution_count: data.execution_count,
            metadata: {},
          },
          "shell",
        ),
      );

      this.eval_queue.popAndRun();
    };

    this._eventHandlers.set("eval.finished", (data: any) => {
      // updating output
      if ("result" in data) {
        this._send(
          this._format_msg(
            data.parent_msg,
            "execute_result",
            {
              execution_count: data.execution_count,
              data: data.result,
              metadata: {},
            },
            "iopub",
          ),
        );
      }
      send_finished_and_continue(data);
    });

    this._eventHandlers.set("eval.error", (data: any) => {
      this._send(
        this._format_msg(
          data.parent_msg,
          "error",
          {
            execution_count: data.execution_count,
            metadata: {},
          },
          "iopub",
        ),
      );
      send_finished_and_continue(data);
    });

    this._eventHandlers.set("eval.output", (data: any) => {
      this._send(
        this._format_msg(
          data.parent_msg,
          "stream",
          {
            name: data.stream,
            text: data.content,
          },
          "iopub",
        ),
      );
    });

    this._eventHandlers.set("eval.input", (data: any) => {
      this._input_resolver = data.resolve;
      this._send(
        this._format_msg(
          data.parent_msg,
          "input_request",
          data.content,
          "stdin",
        ),
      );
    });

    this._eventHandlers.set("eval.display", (data: any) => {
      /* see outputarea.js to understand interaction */
      let send_data: any;
      switch (data.display_type) {
        case "dom-node": // legacy mode only
          /* /!\ big hack /!\
            To allow javascript loading of DOM node,
            we get an id identifying the object. We can then
            pickup the object from its id.
          */
          const id = this.bypassBus.push(data.content);
          send_data = {
            "application/javascript": `element.append(window._basthonBypassBus.pop(${id}));`,
          };
          break;
        case "kernel-iframe":
          const key = this.bypassBus.push(data.content.ports);
          send_data = {
            "text/json-kernel-iframe": JSON.stringify({
              key,
              html: data.content.html,
            }),
          };
          break;
        case "multiple":
          /* typically dispached by display() */
          send_data = data.content;
          break;
        default:
          console.error("Not recognized display_type: " + data.display_type);
      }

      this._send(
        this._format_msg(
          data.parent_msg,
          "display_data",
          {
            data: send_data,
            metadata: {},
            transcient: {},
          },
          "iopub",
        ),
      );
    });

    this._eventHandlers.set("eval.clear-output", (data: any) => {
      this._send(
        this._format_msg(
          data.parent_msg,
          "clear_outptut",
          data.content,
          "iopub",
        ),
      );
    });
  }

  private connectEvents() {
    this._eventHandlers.forEach((v, k) => this.kernel?.addEventListener(k, v));
  }

  private disconnectEvents() {
    this._eventHandlers.forEach((v, k) =>
      this.kernel?.removeEventListener(k, v),
    );
  }

  private async startEvalQueue() {
    await this.kernel?.ready();
    // wrap this in try/catch to avoid firing uncaught exception
    // twice if gui canot be loaded
    try {
      /* FIXME: we should wait for aux/modules to be loaded before
       * executing first cell but how to wait for this without using a
       * global variable? */
      // @ts-ignore
      await Jupyter?.notebook?.basthonGUI?.loaded();
      this.eval_queue.ready = true;
      this.eval_queue.popAndRun();
    } catch (e) {}
  }

  public _send(data: any) {
    this.onmessage?.call(this, { data: JSON.stringify(data) });
  }

  public _format_msg(
    parent: any,
    msg_type: any,
    content: any,
    channel: string,
  ) {
    const parent_header = parent?.header ?? {};
    const session_id = parent_header.session ?? "";
    const msg_id = session_id + "_" + String(this.message_count);
    this.message_count++;
    const username = parent_header.username ?? "username";
    const date = new Date().toISOString();
    const version = parent_header.version ?? "5.2";
    channel = channel ?? parent?.channel;

    return {
      header: {
        msg_id: msg_id,
        msg_type: msg_type,
        username: username,
        session: session_id,
        date: date,
        version: version,
      },
      msg_id: msg_id,
      msg_type: msg_type,
      parent_header: parent_header,
      metadata: {},
      content: content,
      buffers: [],
      channel: channel,
    };
  }

  public _send_busy(parent: any) {
    const msg = this._format_msg(
      parent,
      "status",
      { execution_state: "busy" },
      "iopub",
    );
    this._send(msg);
  }

  public _send_idle(parent: any) {
    const msg = this._format_msg(
      parent,
      "status",
      { execution_state: "idle" },
      "iopub",
    );
    this._send(msg);
  }

  public send(msg: any) {
    msg = JSON.parse(msg);

    let header = msg.header;
    let channel = msg.channel;
    let msg_type = header.msg_type;

    switch (channel) {
      case "shell":
        switch (msg_type) {
          case "kernel_info_request":
            this._send_busy(msg);
            this._send_idle(msg);
            this._send(
              this._format_msg(
                msg,
                "kernel_info_reply",
                { status: "ok" },
                "shell",
              ),
            );
            break;
          case "execute_request":
            let code = msg.content.code;
            this.eval_queue.push({ code: code, parent_msg: msg });
            break;
          case "complete_request":
            (async () => {
              this._send_busy(msg);
              const src = msg.content.code.slice(0, msg.content.cursor_pos);
              const kernelCompletions = await this.kernelSafe?.complete(src);
              if (!kernelCompletions?.length) return;
              const cursor_start = kernelCompletions[1];
              let completions = kernelCompletions[0];
              this._send_busy(msg);
              this._send(
                this._format_msg(
                  msg,
                  "complete_reply",
                  {
                    status: "ok",
                    matches: completions,
                    cursor_start: cursor_start,
                    // explicitly set to null as it will be
                    // dynamically computed from completer.js
                    // (this fix: math.s<tab>q<tab> badly completed)
                    cursor_end: null,
                  },
                  "shell",
                ),
              );
              this._send_idle(msg);
            })();
            break;
        }
        break;
      case "iopub":
        break;
      case "stdin":
        switch (msg_type) {
          case "input_reply":
            this._input_resolver?.(msg?.content?.value);
            break;
        }
        break;
    }
  }

  public close() {
    this.onclose?.call(this);
    this.disconnectEvents();
  }
}
