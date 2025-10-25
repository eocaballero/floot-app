import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { GlobalContextProviders } from "./components/_globalContextProviders";
import Page_0 from "./pages/cart.tsx";
import PageLayout_0 from "./pages/cart.pageLayout.tsx";
import Page_1 from "./pages/my-qr.tsx";
import PageLayout_1 from "./pages/my-qr.pageLayout.tsx";
import Page_2 from "./pages/store.tsx";
import PageLayout_2 from "./pages/store.pageLayout.tsx";
import Page_3 from "./pages/_index.tsx";
import PageLayout_3 from "./pages/_index.pageLayout.tsx";
import Page_4 from "./pages/wallet.tsx";
import PageLayout_4 from "./pages/wallet.pageLayout.tsx";
import Page_5 from "./pages/my-products.tsx";
import PageLayout_5 from "./pages/my-products.pageLayout.tsx";
import Page_6 from "./pages/login.tsx";
import PageLayout_6 from "./pages/login.pageLayout.tsx";

if (!window.requestIdleCallback) {
  window.requestIdleCallback = (cb) => {
    setTimeout(cb, 1);
  };
}

import "./base.css";

const fileNameToRoute = new Map([["./pages/cart.tsx","/cart"],["./pages/my-qr.tsx","/my-qr"],["./pages/store.tsx","/store"],["./pages/_index.tsx","/"],["./pages/wallet.tsx","/wallet"],["./pages/my-products.tsx","/my-products"],["./pages/login.tsx","/login"]]);
const fileNameToComponent = new Map([
    ["./pages/cart.tsx", Page_0],
["./pages/my-qr.tsx", Page_1],
["./pages/store.tsx", Page_2],
["./pages/_index.tsx", Page_3],
["./pages/wallet.tsx", Page_4],
["./pages/my-products.tsx", Page_5],
["./pages/login.tsx", Page_6],
  ]);

function makePageRoute(filename: string) {
  const Component = fileNameToComponent.get(filename);
  return <Component />;
}

function toElement({
  trie,
  fileNameToRoute,
  makePageRoute,
}: {
  trie: LayoutTrie;
  fileNameToRoute: Map<string, string>;
  makePageRoute: (filename: string) => React.ReactNode;
}) {
  return [
    ...trie.topLevel.map((filename) => (
      <Route
        key={fileNameToRoute.get(filename)}
        path={fileNameToRoute.get(filename)}
        element={makePageRoute(filename)}
      />
    )),
    ...Array.from(trie.trie.entries()).map(([Component, child], index) => (
      <Route
        key={index}
        element={
          <Component>
            <Outlet />
          </Component>
        }
      >
        {toElement({ trie: child, fileNameToRoute, makePageRoute })}
      </Route>
    )),
  ];
}

type LayoutTrieNode = Map<
  React.ComponentType<{ children: React.ReactNode }>,
  LayoutTrie
>;
type LayoutTrie = { topLevel: string[]; trie: LayoutTrieNode };
function buildLayoutTrie(layouts: {
  [fileName: string]: React.ComponentType<{ children: React.ReactNode }>[];
}): LayoutTrie {
  const result: LayoutTrie = { topLevel: [], trie: new Map() };
  Object.entries(layouts).forEach(([fileName, components]) => {
    let cur: LayoutTrie = result;
    for (const component of components) {
      if (!cur.trie.has(component)) {
        cur.trie.set(component, {
          topLevel: [],
          trie: new Map(),
        });
      }
      cur = cur.trie.get(component)!;
    }
    cur.topLevel.push(fileName);
  });
  return result;
}

function NotFound() {
  return (
    <div>
      <h1>Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>Go back to the <a href="/" style={{ color: 'blue' }}>home page</a>.</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <GlobalContextProviders>
        <Routes>
          {toElement({ trie: buildLayoutTrie({
"./pages/cart.tsx": PageLayout_0,
"./pages/my-qr.tsx": PageLayout_1,
"./pages/store.tsx": PageLayout_2,
"./pages/_index.tsx": PageLayout_3,
"./pages/wallet.tsx": PageLayout_4,
"./pages/my-products.tsx": PageLayout_5,
"./pages/login.tsx": PageLayout_6,
}), fileNameToRoute, makePageRoute })} 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </GlobalContextProviders>
    </BrowserRouter>
  );
}
