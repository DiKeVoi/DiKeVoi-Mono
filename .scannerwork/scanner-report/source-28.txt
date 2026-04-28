import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={[
        style,
        {
          letterSpacing: 0.4,
        },
      ]}
      {...rest}
    />
  );
}
