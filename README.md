# Metaballs Animation - Interactive Canvas

Una animación interactiva de metaballs (conexiones orgánicas entre círculos) construida con HTML5 Canvas y JavaScript vanilla.

## 🎨 Características

- **Cuadrícula de 25 círculos** (5x5) con disposición cuadrada centrada
- **Interacción con el mouse**: Los círculos crecen cuando el cursor se acerca
- **Conexiones orgánicas**: Algoritmo de metaballs que crea formas fluidas entre círculos
- **Controles en tiempo real**: Tres sliders para personalizar la experiencia

## 🎛️ Controles Interactivos

### 1. **Tamaño Máximo** (0.3x - 1.5x)
Controla qué tan grandes pueden crecer los círculos cuando el mouse se acerca.

### 2. **Factor de Conexión** (0.5x - 2.0x)
Determina qué tan fácil es que los círculos se conecten:
- **< 1.0x**: Conexiones restrictivas (necesitan superponerse)
- **= 1.0x**: Comportamiento estándar (se conectan al tocarse)
- **> 1.0x**: Conexiones a distancia (efecto magnético)

### 3. **Rango del Mouse** (100px - 500px)
Define qué tan lejos puede el mouse influir en los círculos:
- **Rango pequeño**: Efecto localizado y preciso
- **Rango grande**: Influencia amplia y dramática

## 🚀 Cómo usar

1. Abre `index.html` en tu navegador
2. Mueve el mouse sobre los círculos para ver la animación
3. Ajusta los controles en el panel superior izquierdo
4. Experimenta con diferentes combinaciones para efectos únicos

## 🎯 Efectos Sugeridos

- **"Precisión Quirúrgica"**: Tamaño 0.5x, Conexión 0.8x, Rango 125px
- **"Explosión Cósmica"**: Tamaño 1.4x, Conexión 1.8x, Rango 450px
- **"Red Neuronal"**: Tamaño 0.4x, Conexión 1.6x, Rango 350px
- **"Lava Viscosa"**: Tamaño 1.2x, Conexión 0.6x, Rango 200px

## 🛠️ Tecnologías

- **HTML5 Canvas**: Para el renderizado de gráficos
- **JavaScript ES6+**: Lógica de animación y interacción
- **TailwindCSS**: Estilos de la interfaz de usuario
- **Algoritmo de Metaballs**: Matemáticas avanzadas para conexiones orgánicas

## 📐 Algoritmo

El algoritmo de metaballs utiliza:
- **Ecuaciones cuadráticas** para calcular puntos de conexión
- **Curvas de Bézier** para crear formas suaves
- **Trigonometría** para posicionamiento preciso de puntos de control
- **Interpolación lineal** para animaciones fluidas

## 🎨 Personalización

Puedes modificar fácilmente:
- Número de círculos (`gridCount`)
- Colores y estilos CSS
- Rangos de los controles
- Velocidad de animación

## 📱 Responsive

La animación se adapta automáticamente al tamaño de la ventana y mantiene una composición cuadrada centrada en cualquier resolución.

---

**¡Experimenta y crea efectos visuales únicos!**
