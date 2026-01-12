import { Mixpanel } from "mixpanel-react-native";

const mixpanel = new Mixpanel(
  "719f231a1ce17d0f0352731d53609ac3",
  true // track automatic events
);

mixpanel.init();

export default mixpanel;
