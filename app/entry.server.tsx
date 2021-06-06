import ReactDOMServer from "react-dom/server";
import type { EntryContext } from "remix";
import { RemixServer } from "remix";
import { ServerStyleSheet } from "styled-components";

import StylesContext from "./stylesContext";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const sheet = new ServerStyleSheet();

  // first pass to collect styles
  ReactDOMServer.renderToString(
    sheet.collectStyles(
      <StylesContext.Provider value={null}>
        <RemixServer context={remixContext} url={request.url} />
      </StylesContext.Provider>
    )
  );

  // get the styles
  let styles = sheet.getStyleTags().replace(/(<([^>]+)>)/gi, ""); // remove the <style> tags
  sheet.seal();

  let markup = ReactDOMServer.renderToString(
    <StylesContext.Provider value={styles}>
      <RemixServer context={remixContext} url={request.url} />
    </StylesContext.Provider>
  );

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: {
      ...Object.fromEntries(responseHeaders),
      "Content-Type": "text/html",
    },
  });
}
