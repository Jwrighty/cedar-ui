import * as CedarReact from "@jwrighty/cedar-react";

export default function Page() {
  return (
    <main>
      <p>
        Cedar playground — {Object.keys(CedarReact).length} export(s) from
        @jwrighty/cedar-react.
      </p>
    </main>
  );
}
