using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using cssdk;

namespace driver
{
    enum CartItemType
    {
        BasedOnBp = 1,
        AddTemplateVm = 2
    }

    enum TemplateType
    {
        Blueprint = 0,
        Vm = 1
    }

    class Program
    {
        private static ICloudShareClient client;
        private const string API_ID = null;
        private const string API_KEY = null;

        static void Main(string[] args)
        {
            client = CloudShareSdk.GetClient();
            if (API_ID == null || API_KEY == null)
                WriteMissingCredentialsMessage();
            else
                TryRun();
        }

        private static void TryRun()
        {
            try
            {
                Example1().Wait();
            }
            catch (AggregateException e)
            {
                Console.WriteLine("{0}", e.InnerException);
                Console.ReadKey();
            }
        }

        private static async Task Example1()
        {
            var envId = await GetEnvId();
            var machineId = await GetMachineId(envId);
            var output = await Execute(machineId, "echo hello world");
            Console.WriteLine("Output: {0}", output);
        }

        private static async Task Example2()
        {
            var projectId = await GetFirstProjectId();
            var regionId = await GetMiamiRegionId();
            var templateVmId = await GetFirstTemplateVmId();
            var name = CreateEnvironmentName();

            var env = await CreateEnvironment(name, projectId, regionId, templateVmId);

            Console.WriteLine("New environment ID: {0}", env["environmentId"]);
            Console.WriteLine("New environment Name: {0}", name);
            Console.WriteLine("(This new environment is preparing, to avoid unwanted charges log to use.cloudshare.com and delete the environment)");
        }

        private static string CreateEnvironmentName()
        {
            return string.Format("API Example Environment - {0}", GetTimestamp());
        }

        private static string GetTimestamp()
        {
            TimeSpan t = DateTime.UtcNow - new DateTime(1970, 1, 1);
            return ((int)t.TotalSeconds).ToString();
        }

        private static async Task<string> GetFirstProjectId()
        {
            var projects = await GetAsync("projects");
            if (projects.Length == 0)
                throw new Exception("No projects found");
            return projects[0]["id"];
        }

        private static async Task<string> GetMiamiRegionId()
        {
            var regions = await GetAsync<IList<dynamic>>("regions");
            var miami = regions.FirstOrDefault(r => r["name"] == "Miami");
            if (miami == null)
                throw new Exception("Miami region not found");
            return miami["id"];
        }

        private static async Task<string> GetFirstTemplateVmId()
        {
            var templates = await GetAsync<IList<dynamic>>("templates", new
            {
                templateType = TemplateType.Vm,
                take = 1
            });
            var first = templates.FirstOrDefault();
            if (first == null)
                throw new Exception("No templates found");
            return first["id"];
        }

        private static async Task<dynamic> CreateEnvironment(string name, string projectId, string regionId, string templateVmId)
        {
            return await PostAsync("envs", new
            {
                environment = new
                {
                    name = name,
                    description = "Example API environment",
                    projectId = projectId,
                    policyId = (string)null,
                    regionId = regionId
                },
                itemsCart = new List<dynamic>
                {
                    new
                    {
                        type = CartItemType.AddTemplateVm,
                        name = "My Virtual Machine",
                        description = "My Virtual Machine",
                        templateVmId = templateVmId
                    }
                }
            });
        }

        private static async Task<string> GetEnvId()
        {
            var envs = await GetAsync<IList<Env>>("envs");
            if (envs.Count == 0)
                throw new Exception("You don't have any environments! Quitting...");
            var firstEnv = await GetAsync<EnvExtended>("envs/actions/GetExtended", new
                {
                    envId = envs[0].id
                });
            if (firstEnv.statusText != "Ready")
                throw new Exception(string.Format("Your environment is not running, it's status is: {0}", firstEnv.statusText));
            Console.WriteLine("I'm going to run \"echo hello world\" on environment: {0}", envs[0].name);
            return envs[0].id;
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
            var executionStatus = await CheckExecutionStatus(machineId, executionContext["executionId"]);
            var retries = 0;
            while (!executionStatus.Success && retries < 10)
            {
                await Task.Delay(5000);
                executionStatus = await CheckExecutionStatus(machineId, executionContext["executionId"]);
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

        private static async Task<T> GetAsync<T>(string path, object queryParams = null)
        {
            return await RequestAsync<T>(new
            {
                Method = HttpMethodEnum.GET,
                Path = path,
                QueryParams = queryParams,
                Body = (object)null
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
            var response = await client.ReqAsync(GetRequest(options));
            if (response.Status >= 300 || response.Status < 200)
                throw new Exception(response.Content != null ? response.Content["message"] : null);
            return response.Content;
        }

        private static async Task<T> RequestAsync<T>(dynamic options)
        {
            var response = await client.ReqAsync<T>(GetRequest(options));
            if (response.Status >= 300 || response.Status < 200)
                throw new Exception(response.ErrorContent != null ? response.ErrorContent["message"] : null);
            return response.Content;
        }

        private static Request GetRequest(dynamic options)
        {
            return new Request
                {
                    Hostname = "use.cloudshare.com",
                    Method = options.Method,
                    Path = options.Path,
                    QueryParams = options.QueryParams,
                    Body = options.Body,
                    ApiId = API_ID,
                    ApiKey = API_KEY,
                };
        }

        private class Env
        {
            public string id { get; set; }
            public string name { get; set; }
        }

        private class EnvExtended : Env
        {
            public string description { get; set; }
            public string blueprintId { get; set; }
            public string blueprintName { get; set; }
            public string policyId { get; set; }
            public string policyName { get; set; }
            public DateTime expirationTime { get; set; }
            public bool invitationAllowed { get; set; }
            public string organization { get; set; }
            public string ownerEmail { get; set; }
            public string projectId { get; set; }
            public string projectName { get; set; }
            public string snapshotId { get; set; }
            public string snapshotName { get; set; }
            public int statusCode { get; set; }
            public string statusText { get; set; }
            public string regionId { get; set; }
        }

        private static void WriteMissingCredentialsMessage()
        {
            Console.WriteLine("Please enter user API ID and Key in API_ID and API_KEY variables in the source code");
            Console.ReadKey();
        }
    }
}
