import { Alert as NativeAlert, Platform } from "react-native";

// React Native Web does not implement Alert.alert; keep the same confirmations
// for the web preview and the installed mobile app.
export const Alert: Pick<typeof NativeAlert, "alert"> = {
  alert(title, message, buttons, options) {
    if (Platform.OS !== "web")
      return NativeAlert.alert(title, message, buttons, options);
    const text = [title, message].filter(Boolean).join("\n\n");
    if (!buttons?.length) {
      window.alert(text);
      return;
    }
    const action = buttons.find(
      (button) => button.style !== "cancel" && button.text !== "Annuler",
    );
    const cancel = buttons.find(
      (button) => button.style === "cancel" || button.text === "Annuler",
    );
    if (window.confirm(text)) action?.onPress?.();
    else if (cancel) cancel.onPress?.();
    else options?.onDismiss?.();
  },
};
