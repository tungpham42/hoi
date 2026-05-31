import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Divider,
  Layout,
  ConfigProvider,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  CopyOutlined,
  RobotFilled,
  FireFilled,
} from "@ant-design/icons";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "./App.css";

const { Title, Text } = Typography;
const { Content } = Layout;

interface FormValues {
  hints: string[];
}

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [form] = Form.useForm();

  const onFinish = async (values: FormValues) => {
    const validHints =
      values.hints?.filter((hint) => hint && hint.trim() !== "") || [];

    if (validHints.length === 0) {
      message.warning("Vui lòng nhập ít nhất 1 gợi ý nhé!");
      return;
    }

    const combinedPrompt = `Dựa vào các gợi ý sau, hãy tạo một câu lệnh (prompt) chi tiết:\n${validHints.map((h) => `- ${h}`).join("\n")}`;

    setLoading(true);
    setResult("");

    try {
      const response = await axios.post("https://api.soft.io.vn/test", {
        prompt: combinedPrompt,
      });

      const finalResult = response.data?.result || response.data || "";

      if (finalResult) {
        setResult(finalResult);
        message.success("Tạo prompt thành công rồi!");
      } else {
        message.warning("API trả về kết quả rỗng.");
      }
    } catch (error) {
      console.error("API Error:", error);
      message.error("Có lỗi xảy ra khi kết nối. Vui lòng thử lại nha!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      message.success("Đã lưu prompt vào Clipboard! ✨");
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          colorPrimary: "#FF8A65",
          colorInfo: "#FF8A65",
          colorTextBase: "#4A3F35",
          borderRadius: 16,
        },
        components: {
          Input: {
            controlHeightLG: 50,
            colorBgContainer: "#FFFDFB",
          },
          Button: {
            controlHeightLG: 50,
            fontWeight: 600,
          },
        },
      }}
    >
      <Layout className="cozy-layout">
        <Content style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
          <Card bordered={false} className="cozy-card">
            {/* Header section thân thiện */}
            <div
              style={{ textAlign: "center", marginBottom: 40, marginTop: 20 }}
            >
              <div className="icon-wrapper">
                <RobotFilled style={{ fontSize: 42, color: "#FFF" }} />
              </div>
              <Title
                level={2}
                style={{
                  margin: "0 0 8px 0",
                  fontWeight: 800,
                  color: "#3E2723",
                }}
              >
                Gợi ý Câu lệnh AI của bạn nào! 🚀
              </Title>
              <Text style={{ fontSize: 16, color: "#8D6E63" }}>
                Kể cho mình vài gợi ý, mình sẽ viết cho bạn một câu lệnh hoàn
                hảo nhé! 🪄
              </Text>
            </div>

            <Form
              form={form}
              name="dynamic_form_hints"
              onFinish={onFinish}
              initialValues={{ hints: [""] }}
              layout="vertical"
            >
              <Form.List name="hints">
                {(fields, { add, remove }) => (
                  <div style={{ padding: "0 10px" }}>
                    {fields.map((field, index) => (
                      <Form.Item
                        required={false}
                        key={field.key}
                        style={{ marginBottom: 20 }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Form.Item
                            {...field}
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                message: "Bạn quên nhập gợi ý ở đây rồi nè.",
                              },
                            ]}
                            noStyle
                          >
                            <Input
                              placeholder={`Gợi ý ${index + 1} (VD: Viết bằng giọng điệu hài hước, khoảng 200 chữ...)`}
                              size="large"
                              style={{ flex: 1, marginRight: 12 }}
                            />
                          </Form.Item>
                          {fields.length > 1 ? (
                            <MinusCircleOutlined
                              className="dynamic-delete-button"
                              onClick={() => remove(field.name)}
                              style={{ fontSize: 24, cursor: "pointer" }}
                            />
                          ) : null}
                        </div>
                      </Form.Item>
                    ))}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        size="large"
                        style={{
                          backgroundColor: "#FAFAFA",
                          borderColor: "#FFCCBC",
                          color: "#FF8A65",
                        }}
                      >
                        Thêm một ý tưởng nữa
                      </Button>
                    </Form.Item>
                  </div>
                )}
              </Form.List>

              <Form.Item style={{ padding: "0 10px", marginTop: 10 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  icon={<FireFilled />}
                  loading={loading}
                  style={{ boxShadow: "0 4px 14px rgba(255, 138, 101, 0.4)" }}
                >
                  Tạo Prompt Ngay
                </Button>
              </Form.Item>
            </Form>

            {/* Khu vực hiển thị kết quả */}
            {result && (
              <div style={{ marginTop: 40, padding: "0 10px" }}>
                <Divider style={{ borderColor: "#FFCCBC", color: "#8D6E63" }}>
                  Tadaa! Câu lệnh của bạn đây
                </Divider>
                <Card type="inner" className="result-note" bordered={false}>
                  {/* Sử dụng ReactMarkdown để render nội dung */}
                  <div
                    style={{
                      marginBottom: 24,
                      fontSize: 15,
                      color: "#4E342E",
                      lineHeight: 1.7,
                      overflowWrap: "break-word",
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {result}
                    </ReactMarkdown>
                  </div>
                  <Button
                    type="primary"
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                    size="large"
                    style={{ backgroundColor: "#FF7043" }}
                  >
                    Sao chép Prompt
                  </Button>
                </Card>
              </div>
            )}
          </Card>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
