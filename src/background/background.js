import "webpack-target-webextension/lib/background";
import "@/core/umami.js";
import { Events } from "@/core/analytics.js"

window.umami.trackEvent(`Version ${VERSION}`, Events.data);