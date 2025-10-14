# 🚀 Deploy en Easypanel - AI Platform v1

## 📋 Pasos para Deploy

### 1. **Preparar el Repositorio**
```bash
# Asegúrate de que todos los archivos estén en GitHub
git add .
git commit -m "feat: Add deployment configuration"
git push origin main
```

### 2. **Configurar en Easypanel**

1. **Accede a Easypanel** en tu navegador
2. **Selecciona "Caja"** en la sección "Selecciona un servicio"
3. **Configura el proyecto:**
   - **Nombre:** `myagent-dash`
   - **Descripción:** `AI Platform v1 - Digital Workers Manager`
   - **Repositorio:** `https://github.com/sansanal/myagent-dash`

### 3. **Variables de Entorno**

Configura las siguientes variables en Easypanel:

#### **Variables Públicas:**
- `NODE_ENV` = `production`
- `VITE_SUPABASE_URL` = `https://tu-proyecto.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `tu-anon-key`

#### **Secrets (Configurar en Easypanel):**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `SENDGRID_API_KEY`

### 4. **Configuración del Deploy**

- **Puerto:** `3000`
- **Health Check:** `/`
- **Build Command:** Automático (usa Dockerfile)
- **Start Command:** Automático

### 5. **Archivos de Configuración Incluidos**

- ✅ `Dockerfile` - Configuración multi-stage con nginx
- ✅ `nginx.conf` - Configuración del servidor web
- ✅ `easypanel.json` - Configuración específica de Easypanel
- ✅ `.dockerignore` - Archivos a ignorar en el build

### 6. **Verificación Post-Deploy**

1. **Accede a la URL** proporcionada por Easypanel
2. **Verifica que la aplicación carga** correctamente
3. **Comprueba las funcionalidades:**
   - Login/Registro
   - Dashboard
   - Workflows
   - Generador de Documentación

## 🔧 Troubleshooting

### **Error de Build:**
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Easypanel

### **Error de Variables:**
- Asegúrate de que todas las variables de entorno estén configuradas
- Verifica que los secrets estén correctamente configurados

### **Error 404 en Rutas:**
- Verifica que nginx.conf esté configurado para SPA routing
- Comprueba que el build se haya completado correctamente

## 📊 Monitoreo

- **Health Check:** `/` (cada 30 segundos)
- **Logs:** Disponibles en el panel de Easypanel
- **Métricas:** CPU, Memoria, Red

## 🎯 Resultado Esperado

Una aplicación React completamente funcional con:
- ✅ Autenticación con Supabase
- ✅ Dashboard de gestión de workflows
- ✅ Sistema de pagos con Stripe
- ✅ Generador de documentación
- ✅ Responsive design
- ✅ Optimización de rendimiento
