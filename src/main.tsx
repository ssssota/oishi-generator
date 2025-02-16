import { render } from "preact";
import { App } from "./app.tsx";
import "./main.css";

const parent = document.getElementById("app");
if (parent) render(<App />, parent);
