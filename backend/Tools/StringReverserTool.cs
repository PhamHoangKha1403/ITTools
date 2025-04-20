using ITTools.Domain.Interfaces;
using Newtonsoft.Json.Linq;

namespace Tools
{
    public class StringReverserTool : ITool
    {
        // --- Metadata cho Tool ---

        public string Name => "String Reverser";

        public string Description => "Reverses the order of characters in a given string.";

        // ID của ToolGroup trong database (Ví dụ: 2 = Text Processing)
        // !!! QUAN TRỌNG: Đảm bảo ID này tồn tại trong bảng ToolGroups của bạn !!!
        public int GroupId => 2;

        // Công cụ này là miễn phí
        public bool IsPremium => false;

        // --- Schema cho Input và Output ---

        // Input: Cần một trường text tên là "inputText"
        public string InputSchema => @"{
            ""type"": ""object"",
            ""properties"": {
                ""inputText"": {
                ""type"": ""string"",
                ""title"": ""Text to Reverse"",
                ""description"": ""Enter the text you want to reverse.""
                }
            },
            ""required"": [""inputText""]
        }"; // Sử dụng verbatim string (@"...") để không cần escape dấu "

        // Output: Trả về một chuỗi đơn giản là kết quả đã đảo ngược
        public string OutputSchema => @"{
            ""type"": ""string"",
            ""title"": ""Reversed Text""
        }";

        // --- Logic thực thi của Tool ---

        /// <summary>
        /// Thực thi logic đảo ngược chuỗi.
        /// </summary>
        /// <param name="input">Dữ liệu đầu vào, thường là JObject hoặc Dictionary chứa 'inputText'.</param>
        /// <returns>Chuỗi đã được đảo ngược.</returns>
        public Task<object> ExecuteAsync(object input)
        {
            string? textToReverse = null;

            // Xử lý input - Input thường được gửi dưới dạng JSON từ frontend
            // và có thể được deserialize thành JObject hoặc Dictionary ở backend API trước khi truyền vào đây.
            // Cần kiểm tra kiểu và lấy giá trị một cách an toàn.
            if (input is JObject jsonInput)
            {
                textToReverse = jsonInput.Value<string>("inputText");
            }
            else if (input is System.Collections.Generic.Dictionary<string, object> dictInput)
            {
                if (dictInput.TryGetValue("inputText", out var value) && value is string strValue)
                {
                    textToReverse = strValue;
                }
            }
            // Thêm các kiểu kiểm tra khác nếu cần

            // Nếu không lấy được input text hoặc input là null/rỗng
            if (string.IsNullOrEmpty(textToReverse))
            {
                // Trả về chuỗi rỗng hoặc ném lỗi tùy theo thiết kế mong muốn
                // Ở đây trả về chuỗi rỗng
                return Task.FromResult<object>(string.Empty);
            }

            // Thực hiện đảo ngược chuỗi
            char[] charArray = textToReverse.ToCharArray();
            Array.Reverse(charArray);
            string reversedString = new string(charArray);

            // Trả về kết quả (phải là Task<object>)
            return Task.FromResult<object>(reversedString);
        }
    }
}
