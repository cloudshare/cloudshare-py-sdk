import cloudshare
import requests
import urllib.request
import time

# This script adds 10 students to a class, and signs-in on their behalf to start preparing their environments.
#
# Get class ids: https://docs.cloudshare.com/rest-api/v3/training/class/get-class/
# 
# Parameters documentation: https://docs.cloudshare.com/rest-api/v3/training/class/post-apiv3classsponsoredlink/
# Replace <api key>, <api id>, <class id>
# Replace the for loop with a dictionary if you have a list of real students

for i in range(10):
    classId = '<class id>'
    studentEmail = f'student+{i}@domain.com'
    studentFirstName = 'Student'
    studentLastName = f'Number{i}'

    data = {
        "classId": classId,
        "studentEmail": studentEmail,
        "studentFirstName": studentFirstName,
        "studentLastName": studentLastName
    }

    res = cloudshare.req(hostname='use.cloudshare.com',
                                    method='POST',
                                    path='class/sponsoredlink',
                                    content=data,
                                    apiId='<api id>',,
                                    apiKey='<api key>',)
    print(res.status)
    if (res.status / 100 != 2):
            raise Exception(res.status, res.content)
    print(res.content)

    # Login as the student
    url=res.content['loginUrl']
    res = urllib.request.urlopen(url)
    print(res)
    time.sleep(5)
