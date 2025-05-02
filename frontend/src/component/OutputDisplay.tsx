import { Typography, Box } from "@mui/material";

const getTitleFromProperties = (key: string, properties: any): string => {
  return properties?.[key]?.title || key;
};

const renderGenericValue = (value: any): string => {
  if (typeof value === "string") {
    return value;
  }
  if (value === null || typeof value === 'undefined') {
      return '';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    console.error("Error stringifying value:", error);
    return "[Lỗi hiển thị dữ liệu]";
  }
};


const OutputDisplay = ({
  output,
  outputSchema,
}: {
  output: any;
  outputSchema: any;
}) => {

  if (!output || !outputSchema) {
    return null;
  }

  let parsedSchema: any;
  try {
    parsedSchema = typeof outputSchema === "string"
      ? JSON.parse(outputSchema)
      : outputSchema;
    if (typeof parsedSchema !== 'object' || parsedSchema === null) {
        throw new Error("Parsed schema is not a valid object.");
    }
  } catch (error) {
    console.error("Failed to parse outputSchema:", error);
    return <Box sx={{ color: 'error.main', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>Lỗi: Không thể phân tích Output Schema.</Box>;
  }

  const properties = parsedSchema?.properties ?? {};

  if (parsedSchema?.type === "object" && typeof output === "object" && output !== null) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Object.entries(output).map(([key, value]) => {

          const isQrCodeImage = key === 'qrCodeBase64' &&
                                typeof value === 'string' &&
                                value.startsWith('data:image/png;base64,');

          const isQrCodeError = key === 'qrCodeBase64' &&
                                typeof value === 'string' &&
                                value.startsWith('Error:');

          const isSvgImageBase64 = key === 'svgBase64' &&
                                 typeof value === 'string' &&
                                 value.startsWith('data:image/svg+xml;base64,');

          const isSvgString = key === 'svgString';

          const fieldTitle = getTitleFromProperties(key, properties);

          return (
            <Box key={key}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>
                {fieldTitle}
              </Typography>

              {isQrCodeImage ? (
                 <Box
                   sx={{
                     mt: 0.5,
                     p: 0,
                     backgroundColor: 'white',
                     display: 'inline-block',
                     borderRadius: 1,
                   }}
                 >
                   <img
                     src={value}
                     alt={fieldTitle}
                     style={{
                       display: 'block',
                       maxWidth: '250px',
                       height: 'auto',
                       userSelect: 'none',
                     }}
                   />
                 </Box>
              ) : isSvgImageBase64 ? (
                 <Box sx={{
                     mt: 0.5,
                     border: '1px dashed #aaa',
                     padding: '4px',
                     display: 'inline-block',
                     maxWidth: '100%'
                    }}
                  >
                   <img
                     src={value}
                     alt={fieldTitle}
                     style={{
                       display: 'block',
                       maxWidth: '100%',
                       maxHeight: '300px',
                       height: 'auto',
                       userSelect: 'none',
                     }}
                   />
                 </Box>
              ) : (
                <Box
                  sx={{
                    p: isSvgString ? 1 : 1.5,
                    bgcolor: isQrCodeError ? 'error.dark' : 'background.default',
                    color: isQrCodeError ? 'error.contrastText' : '#fff',
                    border: "1px solid #444",
                    borderRadius: 1,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    mt: 0.5,
                    maxHeight: isSvgString ? '200px' : 'none',
                    overflowY: isSvgString ? 'auto' : 'visible',
                  }}
                >
                  {renderGenericValue(value)}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "background.default",
        border: "1px solid #444",
        borderRadius: 1,
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        color: "#fff",
      }}
    >
      {renderGenericValue(output)}
    </Box>
  );
};

export default OutputDisplay;