
# LINE Developer Camp

## Create for Initial Project

1. Create Firebase Project
2. Create Provider & Channel LINE Developer
3. Create Dialogflow Agent

## Installation Tools
1. Postman
2. VS Code
3. Node Version Lasted Version

## Follow Up Step Below

1. Check and Update Package Firebase Tools
````
npm install -g firebase-tools
````

2. Clone Soruce to Diractory Local Project
````
git clone https://github.com/line-dev-camp/workshop.git
````
3. Shell Directory Project
````
cd workshop
````

4. Edit Project Name FIle .firebaserc 
[Firebase Console](https://console.firebase.google.com)
````
{
  "projects": {
    "default": "Project Name from Firebase Project"
  }
}

````

5. Shell Directory Folder
````
cd functions
````
6. Installation Package
  1.axios
  2.firebase-admin
  3.firebase-functions
  4.node-cache
  5.@google-cloud/storage
  6.moment-timezone

````
npm install
````

7. Rename File Environment

````
mv .env.example .env
````
Edit .env

    1. LINE_MESSAGING_CHANNEL_ID= 'LINE Developer Console'
    2. LINE_MESSAGING_CHANNEL_SECRET='LINE Developer Console'
    3. LINE_MESSAGING_ACCESS_TOKEN='LINE Developer Console'
    4. DIALOGFLOW_AGENT_ID='Dialogflow Integration Service (Webhook Id)'

8. Run Project

````
firebase emulators:start
````

-----
##  Deploy : 
Please Check Firebase billing plans : Blaze Pay as you go
````
firebase deploy
````
-----
## LINE API Reference

[Document](https://developers.line.biz/en/docs/)


## 🚀 About Me
Thepnatee Phojan : LINE API Expert 🇹🇭 

Blog : [medium](https://thepnateephojan.medium.com)

