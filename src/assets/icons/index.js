import Vue from "vue";
import SvgIcon from "@/components/SvgIcon";

Vue.component("svg-icon", SvgIcon);
const requireAll = (requireContext) =>
  requireContext.keys().map(requireContext);
const req = require.context("./", true, /\.svg$/);
requireAll(req);

/*
lyrics.svg: chat-square-quote by Bootstrap Icons
lyrics-fill.svg: chat-square-quote-fill by Bootstrap Icons
*/
