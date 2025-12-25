import { FC, memo, useEffect } from "react";
import { BasthonContext } from "@basthon/gui-react";
import { GUI } from "./basthon_gui";
import { Notebook } from "./notebook";

// we use memo here to prevent re-render
const App: FC<{}> = memo(() => {
  useEffect(() => {
    // async call
    import("./start");
  }, []);

  return (
    <BasthonContext GUI={GUI} noInitGUI={true}>
      <Notebook />
    </BasthonContext>
  );
});

export { App };
