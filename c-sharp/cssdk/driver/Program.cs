using System;
using System.Threading.Tasks;
using cssdk;

namespace driver
{
    class Program
    {
        private static ICloudShareClient client;
        private const string API_ID = "5VLLDABQSBESQSKY";
        private const string API_KEY = "4P3RuSCfFbLQvqJqrBWWrxcxIjZHdlz1CkFqQR4jkIftn3C6wTGfcTawQNMKshUo";

        static void Main(string[] args)
        {
            client = CloudShareSdk.GetClient();
            Run().Wait();
        }

        private static async Task Run()
        {
            var envId = await GetEnvId();
            var machineId = await GetMachineId(envId);
            var output = await Execute(machineId, "echo hello world");
            Console.WriteLine("Output: {0}", output);
        }

        private static async Task<string> GetEnvId()
        {
            var envs = await GetAsync("envs");
            if (envs.Length == 0)
                throw new Exception("You don't have any environments! Quitting...");
            var firstEnv = await GetAsync("envs/actions/GetExtended", new
                {
                    envId = envs[0]["id"]
                });
            if (firstEnv["statusText"] != "Ready")
                throw new Exception(string.Format("Your environment is not running, it's status is: {0}", firstEnv["statusText"]));
            Console.WriteLine("I'm going to run \"echo hello world\" on environment: {0}", envs[0]["name"]);
            return envs[0]["id"];
        }

        private static async Task<string> GetMachineId(string envId)
        {
            var machines = await GetAsync("envs/actions/machines", new { eid = envId });
            if (machines.Length == 0)
                throw new Exception("This environment doesn't have any machines! Quitting...");
            Console.WriteLine("On a machine named: {0}", machines[0]["name"]);
            return machines[0]["id"];
        }

        private static async Task<string> Execute(string machineId, string command)
        {
            var executionContext = await PostAsync("vms/actions/executePath", new
            {
                vmId = machineId,
                path = command
            });
            var executionStatus = await CheckExecutionStatus(machineId, executionContext["id"]);
            var retries = 0;
            while (!executionStatus.Success && retries < 10)
            {
                await Task.Delay(5000);
                executionStatus = await CheckExecutionStatus(machineId, executionContext["id"]);
                retries += 1;
            }
            return executionStatus.Output;
        }

        private static async Task<ExecutionStatus> CheckExecutionStatus(string vmId, string executionId)
        {
            Console.WriteLine("Polling...");
            var executionStatus = await GetAsync("vms/actions/checkExecutionStatus", new
            {
                vmId = vmId,
                executionId = executionId
            });
            return new ExecutionStatus
                {
                    Success = executionStatus["success"] != null,
                    Output = executionStatus["standardOutput"]
                };
        }

        private struct ExecutionStatus
        {
            public bool Success { get; set; }
            public string Output { get; set; }
        }

        private static async Task<dynamic> GetAsync(string path, object queryParams=null)
        {
            return await RequestAsync(new
                {
                    Method = HttpMethodEnum.GET,
                    Path = path,
                    QueryParams = queryParams,
                    Body = (object) null
                });
        }

        private static async Task<dynamic> PostAsync(string path, object body=null)
        {
            return await RequestAsync(new
            {
                Method = HttpMethodEnum.POST,
                Path = path,
                QueryParams = (object)null,
                Body = body
            });
        }

        private static async Task<dynamic> RequestAsync(dynamic options)
        {
            var response = await client.ReqAsync(new Request
            {
                Hostname = "use.cloudshare.com",
                Method = options.Method,
                Path = options.Path,
                QueryParams = options.QueryParams,
                Body = options.Body,
                ApiId = API_ID,
                ApiKey = API_KEY,
            });
            if (response.Status >= 300 || response.Status < 200)
                throw new Exception(response.Content != null ? response.Content["message"] : null);
            return response.Content;
        }
    }
}
