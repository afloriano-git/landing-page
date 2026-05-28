**Evaluación: Álvaro Floriano / afloriano-git/landing-page**

**Estado:** Evaluable

**Nota:** 8.80/10

**Desglose:**
- Ejecución y estabilidad: 18/20
- Front-end: 10/15
- Back-end: 14/15
- Funcionalidades: 16/20
- Responsive: 9/10
- Tipografías: 5/5
- Animación: 3/5
- Documentación: 8/10
- Repositorio: 5/5
**Resumen técnico:**
El proyecto se ejecuta correctamente tras crear el `.env` indicado en la documentación y arrancar el servidor desde `backend`. La página `/auth` carga bien, `/portfolio` queda protegida si no hay sesión, y se ha probado el flujo completo de registro, cookie, acceso al portfolio, `/api/auth/check` y logout. Tiene 15 commits, documentación amplia y una separación clara entre front-end y back-end.

**Funcionalidades indicadas:**
- Sistema de rutas y puntos de acceso.
- Registro, login y logout de usuarios.
- Persistencia de sesión mediante cookies.
- Front-end dinámico dependiente del usuario con Axios.
- Efecto visual parallax en el portfolio.
- Funcionalidades adicionales: mensajes de error en autenticación, persistencia local en JSON, menú responsive y texto animado con Typed.js.

**Complejidad del back-end:**
Muy alta para el nivel de una landing. No es solo un formulario con mensaje de éxito: usa Express, validaciones, control de usuarios repetidos, bcrypt con salt para hashear contraseñas, JWT firmado con caducidad, cookie `httpOnly`, `sameSite: "strict"`, middleware para proteger rutas privadas, endpoint de comprobación de sesión, logout y persistencia en JSON. Enhorabuena, porque el esqueleto del backend está muy bien planteado y es escalable para proyectos futuros. No usa una base de datos real y requiere configurar el `.env`, pero aun así la solución está claramente por encima de lo esperado.

**Puntos fuertes:**
La parte más destacable es el back-end, que está trabajado con criterio y no se queda en una simulación. Hay una intención clara de construir una aplicación con acceso protegido y datos personalizados por usuario. El portfolio también tiene detalles visuales interesantes como parallax, tipografías externas, menú responsive y texto animado. Felicidades por conectar la autenticación con una página privada real.

**Aspectos a mejorar:**
El front-end funciona bien y acompaña correctamente, aunque el contenido del portfolio todavía se siente algo genérico y podría tener más personalización real por usuario. También convendría facilitar el arranque para no depender tanto de crear variables a mano.

**Retroalimentación:**
Muy buen trabajo. La autenticación está bastante completa y demuestra esfuerzo técnico real, con una estructura pensada para crecer. Para rematarlo, el siguiente paso sería hacer que el portfolio tuviera más datos editables por usuario y darle un poco más de personalidad propia al front-end.
