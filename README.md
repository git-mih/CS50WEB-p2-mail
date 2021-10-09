# CS50WEB-p3-mail

- A front-end for an email client that makes API calls to send and receive emails.
- You can send, get and update email by using the API (writen in Python and Django). Once we make a request, The API returns a list of emails in JSON format containing all email in the given mailbox (inbox/sent/archive).
- Everything about the email client is writen inside index.js

## preview:
[https://www.youtube.com/watch?v=ZQJ6QfSQ2pA](https://www.youtube.com/watch?v=ZQJ6QfSQ2pA)
[!["link"](https://i.ytimg.com/vi/ZQJ6QfSQ2pA/hqdefault.jpg)](https://www.youtube.com/watch?v=ZQJ6QfSQ2pA)

### How to execute:
1. pip install django
2. py manage.py makemigrations mail
3. py manage.py migrate
4. py manage.py runserver
5. finally, open the browser and go to http://127.0.0.1:8000/


#### Optionally, before runserver, you can create a super user to access Django default administration panel
1. py manage.py createsuperuser
2. http://127.0.0.1:8000/admin
