import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import OutputDisplay from "../component/OutputDisplay";
import { toast } from "react-toastify";
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

function ToolPage() {
  const { toolId } = useParams();
  const [metadata, setMetadata] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!toolId) return;

    getToolMetadata(toolId)
      .then(setMetadata)
      .catch((err) => {
        const message = err?.response?.data?.message || "Failed to load metadata";
        toast.error(message);
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      });
  }, [toolId]);

  const handleSubmit = async ({ formData }: any) => {
    if (!toolId) return;
    try {
      const data = await submitTool(toolId, formData);
      setResult(data);
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
            schema={metadata.inputSchema}
            onSubmit={handleSubmit}
            validator={validator}
            uiSchema={{
              "ui:submitButtonOptions": {
                submitText: "✨ SUBMIT ✨",
              },
            }}
          />
        </Box>

        {result && (
          <Box sx={{ bgcolor: "#263238", p: 3, borderRadius: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              💡 Result
            </Typography>
            <OutputDisplay
              output={result}
              outputSchema={metadata.outputSchema}
            />
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default ToolPage;
