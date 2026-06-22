import * as CedarReact from "@cedar-ui/react";

export default function Page() {
  return (
    <main>
      <p>
        Cedar playground — {Object.keys(CedarReact).length} export(s) from
        @cedar-ui/react.
      </p>
    </main>
  );
}
