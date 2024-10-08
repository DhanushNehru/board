# board
A white board to just write contents and display

<img width="742" alt="Screenshot 2022-10-05 at 2 10 01 PM" src="https://user-images.githubusercontent.com/80240317/195386021-ae58b679-4f69-4112-9fd6-42ff45759cbb.png">


## Gitpod

In the cloud-free development environment where you can directly start coding.

The below command will open up the index.html in a browser in gitpod 
`python -m http.server 8000`

You can use Gitpod in the cloud [![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/DhanushNehru/board/)

## Tech Stack

- HTML
- CSS
- JAVASCRIPT

## Getting Started

To run the project locally we need to setup google signin initially and need a local server like Python's HTTP server or Node.js.

### Setting Up Google Sign-In

1. **Create a Google Cloud Project:**
   - Visit the [Google Cloud Console](https://console.cloud.google.com/).
   - Create new or select an existing project.

2. **Configure OAuth Consent Screen:**
   - In the Cloud Console, navigate to "APIs & Services" > "OAuth consent screen."
   - Configure the OAuth consent screen with the all required details like app name, user support email, etc..

3. **Create OAuth 2.0 Client ID:**
   - In the Cloud Console, go to "APIs & Services" > "Credentials."
   - Click "Create Credentials" > "OAuth client ID."
   - Choose the application type as Web application and add authorized JavaScript origins. ( eg. http://localhost and http://localhost:3000) 
   - Note the generated "Client ID."

4. **Set `data-client_id` in HTML from a JSON file:**
    - In config.json file replace the client_id with the copied value

### Running the Project

To run the project locally, you need a local server. Before that, make sure you have either Python or Node.js installed.

- **Python:** Run the project with Python's HTTP server using: `python -m http.server 3000`.
- **Node.js:** Start the project with `http-server` using: `npx http-server -p 3000`.

Ensure that the port number mentioned here matches the authorized JavaScript origins. If you have any doubts, refer to the [screenshots](https://github.com/DhanushNehru/board/pull/57) in the comments for additional assistance.

### Linting Status

![Linting Status](https://github.com/DhanushNehru/board/actions/workflows/lint.yml/badge.svg)

Clone the project & start contributing

Hey, I am Dhanush N,the maintainer of this opensource repository. You can connect with me and support or follow my work via [Twitter](https://twitter.com/Dhanush_Nehru) / [Instagram](https://www.instagram.com/dhanush_nehru/) / [Youtube](https://www.youtube.com/@dhanushnehru?sub_confirmation=1) / [Github](https://github.com/DhanushNehru) / [Newsletter](https://dhanushn.substack.com/) / [Discord](https://discord.com/invite/Yn9g6KuWyA)

If you like the project support it by starring ⭐
