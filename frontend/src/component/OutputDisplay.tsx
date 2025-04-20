import { Typography, Box } from "@mui/material";

const OutputDisplay = ({
  output,
  outputSchema,
}: {
  output: any;
  outputSchema: any;
}) => {
  if (!output || !outputSchema) return null;

  if (outputSchema.type === "object") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Object.entries(output).map(([key, value]) => (
          <Box key={key}>
            <Typography variant="subtitle2" color="primary">
              {key}
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "#1e1e1e",
                border: "1px solid #444",
                borderRadius: 1,
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                color: "#ffffff"
              }}
            >
              {typeof value === "string"
                ? value
                : JSON.stringify(value, null, 2)}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // ✅ Với dạng kết quả không phải object
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "#1e1e1e",
        borderRadius: 1,
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        color: "#ffffff"
      }}
    >
      {typeof output === "string"
        ? output
        : JSON.stringify(output, null, 2)}
    </Box>
  );
};

export default OutputDisplay;
