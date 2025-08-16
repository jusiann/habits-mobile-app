import {StyleSheet, Text, View} from "react-native";
import {Image} from "expo-image";
import {Link} from "expo-router";
export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <Image source={require("../assets/images/icon.png")} />
      <Text style={styles.title}>Hello World!</Text>
      <Link href='/(auth)'>Sign In</Link>
      <Link href='/(auth)/signup'>Sign Up</Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
