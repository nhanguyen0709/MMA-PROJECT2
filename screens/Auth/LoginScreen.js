import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Block, Button, Input, Text } from "../../components/ui";
import useTheme from "../../hooks/useTheme";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const { colors, sizes } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e?.message || "Lỗi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Block safe gradient={colors.gradients?.secondary}>
      <Block scroll paddingHorizontal={sizes.padding}>
        <Block flex={0} paddingVertical={sizes.xxl} marginTop={sizes.xl}>
          <Text h1 center bold marginBottom={sizes.s} gradient={colors.gradients?.primary}>
            Chào mừng trở lại
          </Text>
          <Text h4 center gray marginBottom={sizes.md}>
            Đăng nhập để tiếp tục
          </Text>
        </Block>

        <Block card flex={0} padding={sizes.padding} marginBottom={sizes.m}>
          <Input
            label="Email"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
            marginBottom={sizes.sm}
            primary
          />
          <Input
            label="Mật khẩu"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            marginBottom={sizes.sm}
            primary
          />

          {!!error && (
            <Block
              flex={0}
              padding={sizes.s}
              radius={sizes.inputRadius}
              color="rgba(231, 76, 60, 0.1)"
              marginBottom={sizes.sm}>
              <Text danger center>
                {error}
              </Text>
            </Block>
          )}
          <Button
            shadow
            disabled={loading}
            onPress={handleLogin}
            marginVertical={sizes.sm}
            radius={sizes.buttonRadius}
            style={{
              backgroundColor: loading ? '#7fbdf0' : '#4A90E2',
              borderWidth: 1.5,
              borderColor: '#2E7DD7',
              opacity: loading ? 0.8 : 1,
              paddingVertical: 8,     // giảm từ 12 xuống 8
              paddingHorizontal: 16,  // giảm từ 20 xuống 16
              alignItems: 'center',
              alignSelf: 'center',    // căn giữa nút
              minWidth: 140,          // đảm bảo không quá nhỏ
            }}
          >
            <Text bold style={{ color: '#fff', fontSize: 14 }}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Text>
          </Button>



          <Button
            flex={0}
            onPress={() => navigation.navigate("Register")}
            marginTop={sizes.s}>
            <Text center primary semibold>
              Chưa có tài khoản? <Text bold primary>Đăng ký ngay</Text>
            </Text>
          </Button>
        </Block>
      </Block>
    </Block>
  );
}
