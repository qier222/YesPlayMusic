import Vue from 'vue';
import SvgIcon from '@/components/SvgIcon';

Vue.component('SvgIcon', SvgIcon);
const requireAll = requireContext => requireContext.keys().map(requireContext);
const req = require.context('./', true, /\.svg$/);
requireAll(req);
