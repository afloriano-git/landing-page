# Documentación técnica - Landing Page con autenticación

## 1. Instrucciones de inicio y ejecución

### Requisitos previos

Para ejecutar el proyecto es necesario tener instalado:

- Node.js
- npm

El proyecto está dividido en dos partes:

- `backend/`: servidor Express, rutas, autenticación, cookies y persistencia de usuarios.
- `frontend/src/`: páginas HTML, estilos CSS y JavaScript del cliente.

### Instalación

Desde la raíz del proyecto:

```bash
npm run install
```

El script raíz ejecuta la instalación de dependencias dentro de `backend`.

### Variables de entorno

El backend utiliza un archivo `backend/.env` para centralizar la configuración. Las variables por defecto para utilizar el proyecto son:

`PORT` es el puerto que abrira el servidor.
`NODE_ENV` es un valor para distinguir entre la fase de produccion y desarrollo.
`USER_DB` es la ruta donde se guardara la base de datos de usuarios.
`JWT_SECRET` es la clave que se utliza para los tokens de session.

### Ejecución

Desde la raíz:

```bash
npm run start
```

Este comando ejecuta:

```bash
npm run start --prefix backend
```

Y dentro de `backend` se lanza:

```bash
node ./src/server.js
```

Una vez levantado el servidor, la aplicación queda disponible normalmente en:

```txt
http://localhost:3000/auth
```

El flujo principal es:

1. El usuario entra en `/auth`.
2. Se registra o inicia sesión.
3. El backend crea una cookie de sesión.
4. El usuario accede a `/portfolio`.
5. El portfolio carga datos dinámicos del usuario autenticado.

### Cronología del deployment

#### Paso 1: Crear .env

> [!WARNING]  
> El .env debe ser creado a mano en el deployment dentro de la carpeta backend/.

```env
PORT=3000
NODE_ENV=production
USER_DB=db/userdb.json
JWT_SECRET=clave_secreta
```

> [!TIP]
> Se recomienda copiar directamente los valores por defecto.

#### Paso 2: Instalar dependencias y arrancar servidor

```bash
npm run install
npm run start
```

> [!IMPORTANT]  
> Ejecutar estos comandos en la raiz del proyecto para el deployment:

## 2. Funcionalidades principales implementadas

Las cinco funcionalidades principales implementadas son:

1. Sistema de rutas y puntos de acceso.
2. Registro, login y logout de usuarios.
3. Persistencia de sesión con control de cookies.
4. Frontend dinámico dependiente del usuario mediante Axios.
5. Efecto visual parallax en el portfolio.

Además, el proyecto incluye diseño responsive para adaptar la interfaz a escritorio, tablet y móvil.

## 3. Funcionalidad 1: sistema de rutas y puntos de acceso

### 3.1. Qué hace

El proyecto implementa un sistema de rutas mediante Express. Estas rutas separan claramente:

- Las páginas HTML públicas o protegidas.
- Los endpoints de autenticación.
- La ruta privada del portfolio.
- La comprobación del usuario autenticado.

Esto permite que el backend controle el acceso a la aplicación y actúe como punto central entre el frontend, la sesión y la persistencia de usuarios.

### 3.2. Cómo lo hace

El servidor principal está definido en `backend/src/server.js`. En este archivo se crea la aplicación Express, se activan middlewares globales y se registran rutas.

Fragmento principal:

```js
const app = express();
const PORT = ENV.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../frontend/src")));

app.use("/api/auth", authRoutes);
app.get("/portfolio", protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/src/portfolio.html"));
});
app.get("/auth", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/src/auth.html"));
});
```

Explicación técnica:

- `express.json()` permite recibir cuerpos JSON en peticiones `POST`, por ejemplo en login y registro.
- `cookieParser()` permite leer cookies desde `req.cookies`, imprescindible para validar la sesión.
- `express.static(...)` sirve los archivos estáticos del frontend: HTML, CSS, JS e imágenes.
- `app.use("/api/auth", authRoutes)` agrupa todas las rutas de autenticación bajo el prefijo `/api/auth`.
- `/portfolio` está protegida con `protectRoute`, por lo que solo se entrega el HTML del portfolio si existe una sesión válida.
- `/auth` entrega la página de login y registro.

En producción también se define una ruta raíz:

```js
if(ENV.NODE_ENV === "production") {
    app.get("/", (req, res) => {
        const token = req.cookies.sessionToken;
        if(!token) return res.redirect("/auth");

        return res.redirect("/portfolio");
    });
}
```

Esta ruta decide si el usuario debe ir a `/auth` o a `/portfolio` dependiendo de si existe una cookie `sessionToken`.

### 3.3. Fragmentos relevantes

Archivo relacionado: `backend/src/routes/auth.route.js`

```js
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check", protectRoute, (req, res) => {
    res.status(201).json(req.user)
});
```

Este archivo define los puntos de acceso de autenticación:

- `POST /api/auth/signup`: registra un usuario.
- `POST /api/auth/login`: inicia sesión.
- `POST /api/auth/logout`: cierra sesión.
- `GET /api/auth/check`: comprueba si la cookie actual pertenece a un usuario válido.

La ruta `/check` usa `protectRoute`, por lo que no devuelve datos si el usuario no está autenticado.

## 4. Funcionalidad 2: registro, login y logout de usuarios

### 4.1. Qué hace

La aplicación permite que un usuario:

- Cree una cuenta con `fullName`, `email` y `password`.
- Inicie sesión usando email y contraseña.
- Cierre sesión desde el portfolio.

El sistema valida los datos del usuario, protege la contraseña mediante hashing y emite una cookie de sesión cuando la autenticación es correcta.

### 4.2. Cómo lo hace

La lógica principal está en `backend/src/controllers/auth.controller.js`.

#### Registro

```js
export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({message:"All fields are required"});
        }
        if(password.length < 6) {
            return res.status(400).json({message:"Password must be at least 6 characters"})
        };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({message:"Invalid email format"});
        }

        const userExists = checkEmailExists(email);
        if(userExists) {
            return res.status(400).json({message:"Email already exists"});
        }
```

Este primer bloque valida:

- Que no falte ningún campo obligatorio.
- Que la contraseña tenga al menos 6 caracteres.
- Que el email tenga un formato válido.
- Que el email no exista ya en la base de datos local.

Después se protege la contraseña:

```js
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

const newUser = new User(fullName, email.toLowerCase(), hashedPassword);
await saveNewUser(newUser);
generateToken(newUser.id, res);
```

Explicación técnica:

- `bcrypt.genSalt(10)` genera una sal criptográfica con 10 rondas.
- `bcrypt.hash(password, salt)` transforma la contraseña en un hash seguro.
- La contraseña original nunca se guarda.
- `email.toLowerCase()` normaliza el correo antes de guardarlo.
- `generateToken(newUser.id, res)` genera el JWT y lo guarda en una cookie.

El modelo de usuario está en `backend/src/model/User.js`:

```js
class User {
    constructor(_fullName, _email, _password) {
        this.id = crypto.randomUUID();
        this.fullName = _fullName;
        this.email = _email;
        this.password = _password;
    }
}
```

El identificador se genera con `crypto.randomUUID()`, lo que proporciona un id único para cada usuario.

#### Login

```js
export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = getUserWithEmail(email);
        if(!user) {
            return res.status(400).json({message:"Invalid credentials"})
        };
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(400).json({message:"Invalid credentials"})
        };

        generateToken(user.id, res);
```

El login busca al usuario por email y compara la contraseña recibida con el hash guardado. La comparación se hace con `bcrypt.compare`, no comparando texto plano.

Si las credenciales son correctas, se llama a `generateToken` para iniciar sesión mediante cookie.

#### Logout

```js
export const logout = async (_, res) => {
    res.cookie("sessionToken", "", {maxAge: 0})
    res.status(200).json({message:"Succesfully logged out"});
}
```

El logout borra la cookie `sessionToken` estableciendo `maxAge: 0`. Así el navegador elimina la sesión y el usuario deja de poder acceder a rutas protegidas.

### 4.3. Fragmentos relevantes

Frontend relacionado: `frontend/src/auth.js`

```js
const res = await axios.post("/api/auth/login", {
    email: email,
    password: password
}, { withCredentials: true });
window.location.href = "/portfolio";
```

Y para registro:

```js
const res = await axios.post("/api/auth/signup", {
    fullName: fullName,
    email: email,
    password: password
}, { withCredentials: true });
window.location.href = "/portfolio";
```

`withCredentials: true` indica a Axios que debe aceptar y enviar cookies asociadas a la petición. Esto conecta directamente el formulario del frontend con la cookie de sesión generada por el backend.

El logout se ejecuta desde `frontend/src/portfolio.js`:

```js
logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
        await axios.post("/api/auth/logout", {}, {
            withCredentials: true
        });
        window.location.href = "/auth";
    } catch (error) {
        console.log(error);
    }
});
```

Este código evita la navegación por defecto, llama al endpoint de logout y redirige al usuario a `/auth`.

## 5. Funcionalidad 3: persistencia de sesión con control de cookies

### 5.1. Qué hace

La sesión del usuario se mantiene aunque cambie de página o recargue el navegador. Para conseguirlo, el backend emite un JWT y lo guarda en una cookie HTTP llamada `sessionToken`.

La cookie se utiliza para:

- Proteger `/portfolio`.
- Identificar al usuario.
- Permitir al frontend consultar `/api/auth/check`.
- Expirar o eliminar la sesión al cerrar sesión.

### 5.2. Cómo lo hace

La creación de la cookie está en `backend/src/lib/token.generator.js`:

```js
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("sessionToken", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "development" ? false : true,
  });

  return token;
};
```

Explicación técnica:

- `jwt.sign({ userId }, ENV.JWT_SECRET, { expiresIn: "7d" })` crea un token firmado con el id del usuario.
- `ENV.JWT_SECRET` es la clave privada usada para firmar y verificar el token.
- `maxAge` define una duración de 7 días en milisegundos.
- `httpOnly: true` impide que JavaScript del navegador lea directamente la cookie, reduciendo riesgos de XSS.
- `sameSite: "strict"` limita el envío de la cookie desde contextos externos y ayuda contra CSRF.
- `secure` pasa a `true` fuera de desarrollo, por lo que en producción la cookie debe viajar por HTTPS.

### 5.3. Fragmentos relevantes

La validación de sesión se hace en `backend/src/middleware/auth.middleware.js`:

```js
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.sessionToken;
        if(!token) return res.redirect("/auth");

        const decodedToken = jwt.verify(token, ENV.JWT_SECRET);
        if(!decodedToken) {
            res.clearCookie("sessionToken");
            return res.redirect("/auth");
        };
```

Este middleware:

- Lee `sessionToken` desde `req.cookies`.
- Si no existe, redirige a `/auth`.
- Si existe, lo verifica con `jwt.verify`.
- Si no es válido, limpia la cookie y redirige.

Después recupera el usuario:

```js
const user = await getUserWithId(decodedToken.userId);
if(!user) return res.status(404).json({message:"User not found"});

req.user = {
    id: user.id,
    fullName: user.fullName,
    email: user.email
};
next()
```

El middleware añade a `req.user` únicamente los datos seguros que necesita la aplicación. No incluye la contraseña ni el hash.

## 6. Funcionalidad 4: frontend dinámico dependiente del usuario con Axios

### 6.1. Qué hace

El portfolio cambia dinámicamente según el usuario autenticado. Cuando el usuario entra en `/portfolio`, el frontend consulta al backend para obtener los datos de sesión y reemplaza textos de la página con el nombre del usuario.

Esto permite que el mismo archivo `portfolio.html` sirva portfolios personalizados en función de la cuenta que haya iniciado sesión.

### 6.2. Cómo lo hace

En `frontend/src/portfolio.html` hay elementos marcados con la clase `user-fullName-dependent`:

```html
<a href="#home" class="logo user-fullName-dependent">NOMBRE</a>
...
<h1 class="user-fullName-dependent">NOMBRE</h1>
...
<p class="copyright user-fullName-dependent">
    © NOMBRE - All Rights Reserved
</p>
```

Estos elementos son placeholders. El JavaScript los localiza y cambia su contenido con los datos recibidos desde el backend.

### 6.3. Fragmentos relevantes

Archivo: `frontend/src/portfolio.js`

```js
async function loadUser() {
    try {
        const res = await axios.get("/api/auth/check", {
            withCredentials: true
        });
        const user = res.data;
        document.querySelectorAll(".user-fullName-dependent").forEach(e => {
            e.textContent = user.fullName;
            if(e.classList.contains("copyright")) {
                e.textContent = "Â© " + user.fullName + " - All Rights Reserved"
            }
        });
    } catch (error) {
        window.location.href = "/auth";
    }
}
```

Explicación técnica:

- `axios.get("/api/auth/check", { withCredentials: true })` llama al backend enviando la cookie de sesión.
- Si la cookie es válida, el backend responde con `req.user`.
- `document.querySelectorAll(".user-fullName-dependent")` selecciona todos los elementos dependientes del nombre.
- `forEach` recorre esos nodos y sustituye su texto.
- Si falla la petición, se redirige al usuario a `/auth`.

En el backend, `/api/auth/check` responde así:

```js
router.get("/check", protectRoute, (req, res) => {
    res.status(201).json(req.user)
});
```

Esta ruta reutiliza el middleware `protectRoute`, por lo que solo devuelve datos si la cookie es válida.

## 7. Funcionalidad 5: efecto parallax

### 7.1. Qué hace

El portfolio incluye un efecto parallax en las secciones principales. Al hacer scroll, diferentes capas visuales se desplazan a distintas velocidades, generando sensación de profundidad.

El efecto se aplica sobre:

- Fondo decorativo.
- Figuras circulares.
- Imagen principal.
- Contenido de la sección Home.
- Contenido e imagen de la sección About.

### 7.2. Cómo lo hace

En `frontend/src/portfolio.html` se definen capas con clase `parallax-layer` y un atributo `data-speed`:

```html
<section id="home" class="home parallax-section">
    <div class="parallax-bg parallax-layer" data-speed="0.12"></div>
    <div class="parallax-shape parallax-shape-one parallax-layer" data-speed="-0.08"></div>
    <div class="parallax-shape parallax-shape-two parallax-layer" data-speed="0.18"></div>
    <div class="home-img parallax-layer" data-speed="0.06">
        <img src="assets/Profile.png" alt="Profile Image">
    </div>
    <div class="home-content parallax-layer" data-speed="-0.04">
```

`data-speed` permite configurar cuánto se mueve cada capa sin cambiar el JavaScript. Los valores positivos y negativos hacen que algunas capas se desplacen en direcciones opuestas.

### 7.3. Fragmentos relevantes

Archivo: `frontend/src/portfolio.js`

```js
const parallaxLayers = document.querySelectorAll('.parallax-layer');

const updateParallax = () => {
    const viewportCenter = window.innerHeight / 2;

    parallaxLayers.forEach((layer) => {
        const speed = Number(layer.dataset.speed) || 0;
        const rect = layer.getBoundingClientRect();
        const layerCenter = rect.top + rect.height / 2;
        const movement = (viewportCenter - layerCenter) * speed;

        layer.style.transform = `translate3d(0, ${movement}px, 0)`;
    });
};

window.addEventListener('scroll', updateParallax, { passive: true });
window.addEventListener('resize', updateParallax);
updateParallax();
```

Explicación técnica:

- `querySelectorAll('.parallax-layer')` obtiene todas las capas animables.
- `window.innerHeight / 2` calcula el centro vertical de la pantalla.
- `getBoundingClientRect()` obtiene la posición real de cada capa respecto al viewport.
- `movement` calcula el desplazamiento según la distancia al centro y la velocidad declarada en HTML.
- `translate3d` aplica la transformación de forma eficiente para el navegador.
- El listener de `scroll` usa `{ passive: true }`, lo que ayuda al rendimiento porque indica que no se va a cancelar el scroll.

En `frontend/src/portfolio.css` se prepara la estructura visual:

```css
.parallax-section {
    position: relative;
    overflow: hidden;
    isolation: isolate;
}

.parallax-layer {
    will-change: transform;
    transition: transform 0.08s linear;
}
```

`overflow: hidden` evita que las capas desplazadas se salgan visualmente de la sección. `will-change: transform` informa al navegador de que esos elementos se van a transformar, ayudando a optimizar la animación.

## 8. Funcionalidades adicionales

### 8.1. Mensajes personalizados de error en autenticación

La página de autenticación incluye un mensaje oculto bajo los formularios. Este mensaje se muestra cuando login o registro fallan.

Fragmento en `frontend/src/auth.html`:

```html
<p id="auth-error" class="auth-error" role="alert" aria-live="polite"></p>
```

La función en `frontend/src/auth.js` lo muestra dinámicamente:

```js
const showAuthError = (message) => {
    authError.textContent = message || "Something went wrong. Please try again.";
    authError.classList.add("show");
};
```

Esto mejora la experiencia de usuario porque el error ya no queda solo en consola, sino que aparece en la interfaz.

### 8.2. Persistencia local en JSON

Aunque no se utiliza una base de datos externa, el proyecto implementa persistencia en archivo mediante `backend/src/lib/usersdb.js`.

```js
const userDbPath = path.join(__dirname, ENV.USER_DB);
fs.mkdirSync(path.dirname(userDbPath), { recursive: true });
if (!fs.existsSync(userDbPath)) {
    fs.writeFileSync(userDbPath, JSON.stringify([]), "utf-8");
}
```

Este fragmento garantiza que la ruta de la base de datos exista y crea el archivo JSON si todavía no existe.

Para guardar usuarios:

```js
export const saveNewUser = (newUser) => {
    usersArray = getUsers();
    usersArray.push(newUser);
    fs.writeFileSync(userDbPath, JSON.stringify(usersArray, null, 2));
};
```

Se lee el estado actual, se añade el nuevo usuario y se vuelve a escribir el JSON con indentación para mantenerlo legible.

## 9. Funcionalidad backend

El backend ya queda explicado dentro de las funcionalidades anteriores, especialmente en:

- Sistema de rutas y puntos de acceso.
- Registro, login y logout.
- Persistencia de sesión con cookies.
- Endpoint `/api/auth/check`.
- Persistencia de usuarios en archivo JSON.

Aun así, de forma resumida, el backend se encarga de:

- Servir el frontend desde `frontend/src`.
- Validar los datos del usuario.
- Hashear contraseñas con `bcryptjs`.
- Firmar JWT con `jsonwebtoken`.
- Guardar la sesión en cookies HTTP-only.
- Proteger rutas privadas con middleware.
- Guardar y consultar usuarios desde `backend/db/userdb.json`.

La arquitectura principal es:

```txt
server.js
 ├─ routes/auth.route.js
 │   ├─ controllers/auth.controller.js
 │   └─ middleware/auth.middleware.js
 ├─ lib/token.generator.js
 ├─ lib/usersdb.js
 └─ model/User.js
```

Esta separación permite que cada archivo tenga una responsabilidad clara:

- `server.js`: arranque del servidor y registro de rutas.
- `auth.route.js`: definición de endpoints.
- `auth.controller.js`: lógica de autenticación.
- `auth.middleware.js`: protección de rutas.
- `token.generator.js`: creación de JWT y cookies.
- `usersdb.js`: lectura y escritura del archivo de usuarios.
- `User.js`: estructura del usuario.

## 10. Responsividad

### 10.1. Qué hace

La interfaz se adapta a diferentes tamaños de pantalla. En escritorio se muestran secciones amplias con layout horizontal, mientras que en móvil se reorganizan los contenidos en columnas y se activa un menú lateral.

Esto afecta principalmente a:

- Header y navegación.
- Sección Home.
- Sección About.
- Tarjetas de servicios.
- Testimonials.
- Formularios.
- Página de autenticación.

### 10.2. Cómo lo hace

La responsividad se implementa mediante media queries en CSS. En `frontend/src/portfolio.css`, por ejemplo:

```css
@media (max-width:786px) {
    #menu-icon {
        display: block;
    }

    .navbar {
        position: absolute;
        top: 100%;
        right: -100%;
        width: 255px;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--main-color);
        transition: all 0.5s ease;
        backdrop-filter: blur(10px);
    }

    .navbar.active {
        right: 0;
    }
}
```

En pantallas pequeñas:

- El icono de menú aparece.
- La navegación se coloca fuera de pantalla con `right: -100%`.
- Cuando JavaScript añade `.active`, la navegación entra con `right: 0`.

El control del menú está en `frontend/src/portfolio.js`:

```js
menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

window.addEventListener('scroll', () => {
    menu.classList.remove('bx-x');
    navbar.classList.remove('active');
});
```

Este código abre o cierra el menú móvil y lo cierra automáticamente al hacer scroll.

### 10.3. Fragmentos relevantes

Adaptación de layout:

```css
@media (max-width:786px) {
    .home{
        flex-direction: column;
    }

    .home-content{
        order: 2;
        margin-left: 1rem;
    }

    .home-img img{
        width: 70vw;
        margin-top: 4rem;
    }

    .about{
        flex-direction: column-reverse;
    }
}
```

Este bloque cambia la composición horizontal a vertical, aumenta el tamaño relativo de las imágenes en móvil y mejora la lectura en pantallas estrechas.

En `frontend/src/auth.css` la página de login/registro también se adapta:

```css
@media (max-width: 991px) {
    .auth-forms {
        grid-template-columns: 1fr;
    }
}
```

En escritorio los formularios de login y registro aparecen en dos columnas. En pantallas más pequeñas pasan a una sola columna, evitando que el contenido quede comprimido.

## Conclusión técnica

El proyecto combina una landing page tipo portfolio con un backend funcional de autenticación. La parte más importante técnicamente es la integración entre Express, JWT, cookies HTTP-only, rutas protegidas y frontend dinámico con Axios.

El resultado es una aplicación donde el usuario puede registrarse, iniciar sesión, mantener su sesión mediante cookies, acceder a una página protegida y ver datos personalizados dentro del portfolio. Además, se añaden detalles visuales como parallax, tipografías externas, diseño responsive y mensajes de error personalizados para mejorar la experiencia final.
