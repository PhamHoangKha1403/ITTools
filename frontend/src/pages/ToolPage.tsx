import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import OutputDisplay from "../component/OutputDisplay";
import { toast } from "react-toastify";
import { WidgetProps } from "@rjsf/utils";
import { Switch, FormControlLabel } from "@mui/material";
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Box,
  createTheme,
} from "@mui/material";
import { getToolMetadata, submitTool } from "../service/api";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#212121",
      paper: "#2c2c2c",
    },
  },
});
const ToggleWidget = ({ value, onChange, label }: WidgetProps) => (
  <FormControlLabel
    control={
      <Switch
        checked={!!value}
        onChange={(event) => onChange(event.target.checked)}
      />
    }
    label={label}
  />
);

function ToolPage() {
  const { toolId } = useParams();
  const [metadata, setMetadata] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    console.log("toolId:", toolId);
    if (!toolId) return;
    setResult(null);

    console.log("toolId:", toolId);
    getToolMetadata(parseInt(toolId))
      .then((res) => {
        if (res.status === 200) {
          console.log("data:", res.data.data);
          setMetadata(res.data.data);
        } else {
          // Chỉ gọi toast một lần ở đây
          toast.error(res.data.message || "Tool not found or failed to load");
          // setTimeout(() => { // Bỏ setTimeout dư thừa này
          //   toast.error(res.data.message || "Tool not found");
          // });
        }
      })
      .catch((err) => {
        const message = err?.response?.data?.message || "Failed to load metadata";
        toast.error(message);
        // setTimeout(() => {
        //  // window.location.href = "/"; // Giữ comment nếu chưa cần redirect
        // });
      });
  }, [toolId]);

  const handleSubmit = async ({ formData }: any) => {
    if (!toolId) return;
    try {
      const res = await submitTool(parseInt(toolId), formData);
      setResult(res.data);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to process tool";
      toast.error(message);
    }
  };


  if (!metadata)
    return <div className="text-white p-8">🔄 Loading tool...</div>;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ pt: 6, pb: 8 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          {metadata.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {metadata.description}
        </Typography>

        <Box
          sx={{
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Form
            schema={JSON.parse(metadata.inputSchema).schema}
            uiSchema={JSON.parse(metadata.inputSchema).uiSchema}
            onSubmit={handleSubmit}
            validator={validator}
            widgets={{ toggle: ToggleWidget }}
          />
        </Box>

        {result && (
          <Box sx={{ bgcolor: "#263238", p: 3, borderRadius: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              💡 Result
            </Typography>

            <OutputDisplay
              output={result}
              outputSchema={JSON.parse(metadata.outputSchema)}
            />
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default ToolPage;