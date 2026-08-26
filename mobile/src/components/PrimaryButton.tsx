import { Button, type ButtonProps } from "react-native-paper";

export function PrimaryButton(props: ButtonProps) {
  return (
    <Button
      mode="contained"
      contentStyle={{ minHeight: 54 }}
      labelStyle={{ fontSize: 16, fontWeight: "700" }}
      {...props}
    />
  );
}
