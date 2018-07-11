// Encryption/decryption library
const crypt = {
  encrypt: (message, key) => CryptoJS.AES.encrypt(message, key).toString(),
  decrypt: (cipher, key) => CryptoJS.AES.decrypt(cipher.toString(), key).toString(CryptoJS.enc.Utf8)
};

// Generate a random string
const rndstr = () => Math.random().toString(36).substring(2, 10);

// Dummy test for a lack of an API
const dummy = crypt.encrypt('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'abcdefg');


const rest = (path, { method='GET', headers={}, body } = {}) => {
  const url = `https://api.jsonbin.io/${path.replace(/^\//, '')}`;
  const options = { method, headers: {
      'Content-Type': 'application/json',
      'Accepts': 'application/json',
      ...headers
    }
  };
  if (body) options.body = typeof body === 'string' ? body : JSON.stringify(body);
  return fetch(url, options).then(res => res.json());
};

const api = {
  get: (url, headers) => rest(url, { headers }),
  post: (url, body, headers) => rest(url, { method: 'post', body, headers }),
  put: (url, body, headers) => rest(url, { method: 'put', body, headers }),
  del: (url, body, headers) => rest(url, { method: 'del', body, headers }),
};



// The HTML elements
const $decrypt = sel => u('article.decrypt').find(sel);
const $encrypt = sel => u('article.encrypt').find(sel);


// Decrypt provided the cipher from the API and the user key
const decrypt = (cipher, key) => {
  try {
    const plain = crypt.decrypt(cipher, key);
    if (!plain) throw new Error('Invalid password');
    $decrypt('.password').removeClass('error');
    console.log(marked(plain));
    $decrypt('.message').first().innerHTML = marked(plain);
  } catch (error) {
    $decrypt('.password').addClass('error');
    $decrypt('.message').first().innerHTML = '';
  }
};


// Encrypt from the message and key and redirects to the encrypted pad
const encrypt = async (message, key) => {
  try {
    $encrypt('.message, .password').removeClass('error');
    if (!message) return $encrypt('.message').addClass('error');
    if (!key) return $encrypt('.password').addClass('error');
    const res = await api.post('/b', { message: crypt.encrypt(message, key) });
    $encrypt('.message').first().value = '';
    $encrypt('.password').first().value = '';
    window.location.hash = res.id;
  } catch (error) {
    alert(error.message);
  }
};

// Handle events for the encrypting form
$encrypt('form').handle('submit', e => encrypt(
  $encrypt('.message').first().value,
  $encrypt('.password').first().value
));

const parse = async () => {
  $decrypt('.url').first().value = window.location.href;

  const id = window.location.hash.replace(/^\#/, '');

  // Add the class 'encrypt' or 'decrypt' to the body depending on the id
  u('body').toggleClass('encrypt', !id).toggleClass('decrypt', !!id);

  if (!id) return;
  const { message: cipher } = await api.get(`/b/${id}`);
  $decrypt('.password').first().focus();
  $decrypt('.password').on('click keyup change', e => decrypt(cipher, e.target.value));
};
parse();
window.addEventListener("hashchange", parse, false);
