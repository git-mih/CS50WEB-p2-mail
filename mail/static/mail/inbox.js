document.addEventListener('DOMContentLoaded', function() {

  // buttons that toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // form that compose and send a email
  document.querySelector("#compose-form").addEventListener('submit', send_email);

  // by default, load the user inbox
  load_mailbox('inbox');
});


function compose_email() {
  // display compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail').style.display = 'none';

  // clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function createTable() {
  const table = document.createElement('table');
  table.classList.add('content-table');
  document.querySelector("#emails-view").appendChild(table);

  const tbody = document.createElement('tbody');
  document.querySelector("table").appendChild(tbody);
};


async function load_mailbox(mailbox) {
  // show the given mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';

  // mailbox title. eg: Inbox, Sent, Archive.
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox == 'inbox') {
    createTable();

    const emails = await getEmail('inbox');
    if (emails.length > 0) {
      emails.forEach((email) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
              <td>${email.sender}</td>
              <td>${email.subject}</td>
              <td>${email.body.slice(0, 64)}</td>
              <td>${email.timestamp}</td>
            </tr>
        `;
        if (email.read) {
          tr.classList.add('read');
        }
        tr.setAttribute('data-email_id', email.id);
        tr.addEventListener('click', emailDetail.bind(email));
        document.querySelector('tbody').appendChild(tr);
      });
    } else {
      const div = document.createElement('div');
      div.classList.add('card');
      div.innerHTML = `
        <div class="card-body">
          <p class="lead">Your Primary inbox is empty.</p>
          <p class="text-muted lead">Personal email messages and emails that don’t appear in other tabs will be shown here.</p>
        </div>
      `;
      document.querySelector('#emails-view').appendChild(div);
    }
  }

  // sent emails
  else if (mailbox == 'sent') {
    createTable();

    // fetch inbox data from server-side (Django)
    const emails = await getEmail('sent');

    if (emails.length > 0) {
      emails.forEach((email) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
              <td><span class="text-muted">To:</span> ${email.recipients.slice(0, 64)}</td>
              <td><span class="text-muted">Subject:</span> ${email.subject}</td>
            </tr>
        `;
        tr.setAttribute('data-email_id', email.id);
        tr.addEventListener('click', emailDetail.bind(email));

        document.querySelector('tbody').appendChild(tr);
      });
    } else { 
      // no emails on inbox
      const div = document.createElement('div');
      div.classList.add('card');
      div.innerHTML = `
        <div class="card-body">
          <p class="lead">You have not sent any email yet.</p>
        </div>
      `;
      document.querySelector('#emails-view').appendChild(div);
    };
  }

  // archived emails
  else if (mailbox == 'archive') {
    createTable();

    // fetch archived emails from Django
    const emails = await getEmail('archive');

    if (emails.length > 0) {
      emails.forEach((email) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <tr>
              <td>${email.sender}</td>
              <td>${email.subject}</td>
              <td>${email.body.slice(0, 64)}</td>
              <td>${email.timestamp}</td>
            </tr>
        `;
        tr.setAttribute('data-email_id', email.id);
        tr.addEventListener('click', emailDetail.bind(email));
        document.querySelector('tbody').appendChild(tr);
      });
    } else {
      // if there is no archived email
      const div = document.createElement('div');
      div.classList.add('card');
      div.innerHTML = `
        <div class="card-body">
          <p class="lead">No Archived emails.</p>
        </div>
      `;
      document.querySelector('#emails-view').appendChild(div);
    };
  };
};

// display details of a particular email when clicked on
function emailDetail() {
  email = this;
  title = email.subject;

  // hide other views and display the correct one
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'block';
  document.querySelector('#email-detail').innerHTML = `<h3 class="display-4">${title.charAt(0).toUpperCase() + title.slice(1)}</h3>`;
  
  // once we open up the email detail, set email as read
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });

  // create email structure
  const div = document.createElement('div');
  if (email.archived) {
    // disable archive button
    div.innerHTML = `
      <div class="float-right">
        <button type="button" id="btn-reply" class="btn btn-sm btn-success align-right">
          <i class="fas fa-reply"></i>
        </button>
        <button disabled type="button" id="btn-archive" class="btn btn-sm btn-dark btn-dis">
          <i class="fas fa-archive"></i>
        </button>
      </div>
      <p class="h1 mb-3">${email.sender} <span class="lead text-muted ml-2">${email.timestamp}<span></p>
      <hr class"hr">
      <p id="detail-text" class="lead">${email.body}</p>
      <p class="text-right"> <span class="lead text-muted">Recipients:</span> ${email.recipients}</p>
      <hr>
    `;
  } else {
    div.innerHTML = `
      <div class="float-right">
        <button type="button" id="btn-reply" class="btn btn-sm btn-success align-right">
          <i class="fas fa-reply"></i>
        </button>
        <button type="button" id="btn-archive" class="btn btn-sm btn-dark">
          <i class="fas fa-archive"></i>
        </button>
      </div>
      <p class="h1 mb-3">${email.sender} <span class="lead text-muted ml-2">${email.timestamp}<span></p>
      <hr class"hr">
      <p id="detail-text" class="lead">${email.body}</p>
      <p class="text-right"> <span class="lead text-muted">Recipients:</span> ${email.recipients}</p>
      <hr>
    `;
  };
  document.querySelector('#email-detail').appendChild(div);

  // archive email event
  document.querySelector("#btn-archive").addEventListener('click', () => {
    if (!email.archived) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      }).then(() => {
        load_mailbox('archive');
      });
    }
  });

  // email reply event
  document.querySelector('#btn-reply').addEventListener('click', () => {
    // show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-detail').style.display = 'none';

    // pre fill composition fields
    document.querySelector('#compose-recipients').value = email.sender;
    const subject = document.querySelector('#compose-subject').value = email.subject;
    if (subject.startsWith('Re')) {
      document.querySelector('#compose-subject').value = email.subject;
    } else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    document.querySelector('#compose-body').value = `${email.timestamp} wrote:`;
  })
};

// util functions
function getEmail(str) {
  const data = fetch(`/emails/${str}`)
  .then(response => response.json())
  .then(emails => {
    return emails;
  });
  return data;
}

function send_email() {
  // get input composition data
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // send a POST request to Django
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients,
        subject,
        body
    })
  })
  .then(response => response.json())
  .then(() => {
      // load user sent mailbox
      load_mailbox('sent');
  });
};
