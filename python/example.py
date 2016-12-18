#!/usr/bin/python
import cssdk, time
from collections import namedtuple

CartItemType = namedtuple("CartItemType", ["BASED_ON_BP", "ADD_TEMPLATE_VM"])(1,2)
TemplateType = namedtuple("TemplateType", ["BLUEPRINT", "VM"])(0,1)

API_ID = "5VLLDABQSBESQSKY"
API_KEY = "4P3RuSCfFbLQvqJqrBWWrxcxIjZHdlz1CkFqQR4jkIftn3C6wTGfcTawQNMKshUo"

def main():
	example1_execute_command_on_machine()

def example1_execute_command_on_machine():
	env = get_first_env()
	machine = get_first_machine(env)
	execution = execute_path(machine, "echo hello world")
	execution_status = get_execution_status(machine, execution)
	while not execution_status['success']:
		time.sleep(5)
		execution_status = get_execution_status(machine, execution)
	print "Execution finished! output:\n%s" % execution_status['standardOutput']

def example2_create_custom_environment():
	project_id = get_first_project_id()
	miami_region_id = get_miami_region_id()
	template_vm_id = get_first_template_vm_id()
	name = create_environment_name()
	env = create_environment(name, project_id, miami_region_id, template_vm_id)
	print "New environment ID: " + env["environmentId"]
	print "New environment Name: " + name
	print "(This new environment is preparing, to avoid unwanted charges log to use.cloudshare.com and delete the environment)"

def get_first_project_id():
	projects = get("projects")
	if len(projects) == 0:
		raise Exception("No projects found")
	return projects[0]["id"]

def get_miami_region_id():
	regions = [r for r in get("regions") if r["name"] == "Miami"]
	if len(regions) == 0:
		raise Exception("'Miami' region not found")
	return regions[0]["id"]

def get_first_template_vm_id():
	templates = get("templates", {
		"templateType": TemplateType.VM,
		"take": 1
	})
	if len(templates) == 0:
		raise Exception("No VM templates found")
	return templates[0]["id"]

def create_environment(name, projectId, regionId, templateVmId):
	return post("envs", {
		"environment": {
			"name": name,
			"description": "Environment created from API example",
			"projectId": projectId,
			"policyId": None,
			"regionId": regionId
		},
		"itemsCart": [
			{
				"type": CartItemType.ADD_TEMPLATE_VM,
				"name": "123",
				"description": "123123",
				"templateVmId": templateVmId
			}
		]
	})

def create_environment_name():
	return "API Example Environment - " + get_timestamp()

def get_first_env():
	envs = get('envs/')
	if len(envs) == 0:
		raise Exception("You don't have any environments!")
	if get_env_status(envs[0]) != "Ready":
		raise Exception("Your first environment is not running!")
	print "I found the \"%s\" environment." % envs[0]['name']
	return envs[0]

def get_env_status(env):
	return get('/envs/actions/getExtended', {'envId': env['id']})['statusText']

def get_first_machine(env):
	machines = get('envs/actions/machines/', {'eid': env['id']})
	if len(machines) == 0:
		raise Exception("Your first environment doesn't have any machines!")
	print "I'm going to execute \"echo hello world\" on the machine \"%s\" machine in environment \"%s\" ." % (machines[0]['name'], env['name'])
	return machines[0]

def execute_path(machine, command):
	return post('/vms/actions/executePath', {
		'vmId': machine['id'],
		'path': command	
	})

def get_execution_status(machine, execution):
	print "polling execution status..."
	return get("vms/actions/checkExecutionStatus", {
		'vmId': machine['id'],
		'executionId': execution['executionId']
	})

def post(path, content=None):
	return request('POST', path, content=content)

def get(path, queryParams=None):
	return request('GET', path, queryParams=queryParams)

def request(method, path, queryParams=None, content=None):
	res = cssdk.req(hostname="use.cloudshare.com",
					 method=method,
					 apiId=API_ID,
					 apiKey=API_KEY,
					 path=path,
					 queryParams=queryParams,
					 content=content)
	if res.status / 100 != 2:
		raise Exception('{} {}'.format(res.status, res.content['message']))
	return res.content

def get_timestamp():
	return str(int(time.time()))

if __name__ == "__main__":
	main()