using System;
using System.Net.Http;
using System.Text;

public class CPHInline
{
    /*
     * Paste your deployed Worker URL and secret below.
     * The secret must match UPDATE_TOKEN in Cloudflare.
     */
    private const string WorkerUpdateUrl =
        "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev/update";

    private const string UpdateToken =
        "REPLACE_WITH_YOUR_LONG_RANDOM_SECRET";

    public bool Execute()
    {
        return SendStatus(false);
    }

    private bool SendStatus(bool isLive)
    {
        try
        {
            string streamTitle = "";
            string streamUrl =
                "https://www.youtube.com/@TigerNoslen";

            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add(
                    "X-TNG-Token",
                    UpdateToken
                );

                string json =
                    "{"
                    + "\"live\":" + isLive.ToString().ToLower() + ","
                    + "\"title\":\"" + EscapeJson(streamTitle) + "\","
                    + "\"streamUrl\":\"" + EscapeJson(streamUrl) + "\""
                    + "}";

                using (
                    StringContent content = new StringContent(
                        json,
                        Encoding.UTF8,
                        "application/json"
                    )
                )
                {
                    HttpResponseMessage response =
                        client.PostAsync(
                            WorkerUpdateUrl,
                            content
                        ).GetAwaiter().GetResult();

                    string responseText =
                        response.Content
                            .ReadAsStringAsync()
                            .GetAwaiter()
                            .GetResult();

                    if (!response.IsSuccessStatusCode)
                    {
                        CPH.LogError(
                            "TNG live-status update failed: "
                            + (int)response.StatusCode
                            + " "
                            + responseText
                        );

                        return false;
                    }

                    CPH.LogInfo(
                        "Tiger Nation HQ status changed to OFFLINE."
                    );

                    return true;
                }
            }
        }
        catch (Exception exception)
        {
            CPH.LogError(
                "TNG live-status exception: "
                + exception.Message
            );

            return false;
        }
    }

    private string EscapeJson(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return "";
        }

        return value
            .Replace("\\", "\\\\")
            .Replace("\"", "\\\"")
            .Replace("\r", "\\r")
            .Replace("\n", "\\n");
    }
}
