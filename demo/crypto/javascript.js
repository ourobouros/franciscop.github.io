// Encryption/decryption library
const crypt = {
  encrypt: (message, key) => CryptoJS.AES.encrypt(message, key).toString(),
  decrypt: (cipher, key) => CryptoJS.AES.decrypt(cipher.toString(), key).toString(CryptoJS.enc.Utf8)
};



// Wrapper around fetch with common headers, JSON, etc
const rest = (path, { method='GET', headers={}, body } = {}) => {
  const url = `https://api.jsonbin.io/${path.replace(/^\//, '')}`;
  const options = { method, headers: Object.assign({}, {
      'Content-Type': 'application/json',
      'Accepts': 'application/json',
    }, headers)
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



// Selector for the two main HTML elements
const $decrypt = sel => u('article.decrypt').find(sel);
const $encrypt = sel => u('article.encrypt').find(sel);



// Decrypt provided the cipher from the API and the user key
const decrypt = (cipher, key) => {
  try {
    if (!key) return $decrypt('.preview').first().innerHTML = '';
    const plain = crypt.decrypt(cipher, key);
    if (!plain) throw new Error('Invalid password');
    $decrypt('.password').removeClass('error');
    $decrypt('.preview').first().innerHTML = marked(plain);
  } catch (error) {
    $decrypt('.password').addClass('error');
    $decrypt('.preview').first().innerHTML = '— Invalid Password —';
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



// Show the preview of the markdown
const preview = e => {
  $encrypt('.preview').first().innerHTML = marked($encrypt('.message').first().value);
};
$encrypt('.message').on('click keyup change', preview);

const parse = async () => {
  // Reset some of the fields
  u('.password').each(pass => { pass.value = ''; });
  $encrypt('.message').first().value = `# Hi there! 👋

Write a bit of Markdown here. Or just plain text, we *won't* judge.

Then add a password and click "Encrypt" to get a secure URL.

You can share this URL with anyone; they'll need the key to read it.`;
  $decrypt('.preview').first().innerHTML = '';
  preview();
  $decrypt('.url').first().value = window.location.href;

  const id = window.location.hash.replace(/^\#/, '');

  // Add the class 'encrypt' or 'decrypt' to the body depending on the id
  u('body').toggleClass('encrypt', !id).toggleClass('decrypt', !!id);


  if (!id) return;
  const { message: cipher } = await api.get(`/b/${id}`);
  $decrypt('.password').first().focus();
  $decrypt('.password').on('keyup change', e => decrypt(cipher, e.target.value));
};
parse();
window.addEventListener("hashchange", parse, false);
