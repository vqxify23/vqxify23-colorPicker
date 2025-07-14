const vqxify23 = {
    colorPicker(options) {
        const {
            containerWhereIsCreated,
            colorPickerData = {},
            hueBarData = {},
            onColorChange
        } = options;

        const {
            width: sbWidth = 213,
            height: sbHeight = 176,
            borderRadius: sbBorderRadius = 8,
        } = colorPickerData;

        const {
            width: hueWidth = 15,
            height: hueHeight = sbHeight,
            borderRadius: hueBorderRadius = sbBorderRadius,
        } = hueBarData;

        const container = document.querySelector(containerWhereIsCreated);

        if (!container) {
            console.error("Vqxify23-ColorPicker: No area selected!");
            return;
        }

        const style = document.createElement("style");
        
        style.textContent = `
            .vqx-sb-area {
                width: ${sbWidth}px;
                height: ${sbHeight}px;
                position: relative;
                cursor: crosshair;
                border-radius: ${sbBorderRadius}px;
            }

            .vqx-dot {
                width: 12px;
                height: 12px;
                border: 2px solid white;
                border-radius: 50%;
                position: absolute;
                pointer-events: none;
                box-shadow: 0 0 5px #000;
                transform: translate(-6px, -6px);
            }

            .vqx-hue-bar {
                width: ${hueWidth}px;
                height: ${hueHeight}px;
                background: linear-gradient(to top, red, yellow, lime, cyan, blue, magenta, red);
                position: relative;
                cursor: pointer;
                border-radius: ${hueBorderRadius}px;
                margin-left: 10px;
            }

            .vqx-hue-slider {
                position: absolute;
                left: 0;
                width: 100%;
                height: 4px;
                background: #fff;
                box-shadow: 0 0 4px #000;
                transform: translateY(-2px);
                border-radius: 4px;
            }

            .vqx-color-picker {
                display: flex;
                align-items: center;
            }
        `;

        document.head.appendChild(style);

        container.innerHTML = `
            <div class="vqx-color-picker">
                <div class="vqx-sb-area">
                    <div class="vqx-dot"></div>
                </div>
                <div class="vqx-hue-bar">
                    <div class="vqx-hue-slider"></div>
                </div>
            </div>
        `;

        const sbArea = container.querySelector(".vqx-sb-area");
        const sbDot = container.querySelector(".vqx-dot");
        const hueBar = container.querySelector(".vqx-hue-bar");
        const hueSlider = container.querySelector(".vqx-hue-slider");

        const state = {
            hue: 0,
            customColor: "#ffffff"
        };

        function rgbToHex(rgb) {
            const result = rgb.match(/\d+/g);

            if (!result) return "#000000";

            return "#" + result.map(x => {
                const hex = parseInt(x).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            }).join('');
        }

        function hslToRgb(h, s, l) {
            s /= 100;
            l /= 100;

            let c = (1 - Math.abs(2 * l - 1)) * s;
            let x = c * (1 - Math.abs((h / 60) % 2 - 1));
            let m = l - c / 2;
            let r = 0, g = 0, b = 0;

            if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
            else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
            else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
            else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
            else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
            else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];

            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);
            
            return `rgb(${r}, ${g}, ${b})`;
        }

        function setSBBackground() {
            sbArea.style.background = `
        linear-gradient(to top, black, transparent),
        linear-gradient(to right, white, hsl(${state.hue}, 100%, 50%))
      `;
        }

        hueBar.addEventListener("mousedown", (e) => {
            const rect = hueBar.getBoundingClientRect();

            const updateHue = (e) => {
                let y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
                state.hue = Math.round(360 - (y / rect.height) * 360);
                hueSlider.style.top = `${y}px`;
                setSBBackground();
            };

            updateHue(e);

            document.addEventListener("mousemove", updateHue);
            document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", updateHue);
            }, { once: true });
        });

        sbArea.addEventListener("mousedown", (e) => {
            const rect = sbArea.getBoundingClientRect();

            const updateColor = (e) => {
                const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

                sbDot.style.left = `${x}px`;
                sbDot.style.top = `${y}px`;

                const sat = (x / rect.width) * 100;
                const light = 100 - (y / rect.height) * 100;

                const color = hslToRgb(state.hue, sat, light);
                state.customColor = color;

                if (typeof onColorChange === "function") {
                    onColorChange(color);
                }
            };

            updateColor(e);

            document.addEventListener("mousemove", updateColor);
            document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", updateColor);
            }, { once: true });
        });

        setSBBackground();

        return {
            getColor: (format = 'rgb') => {
                if (format === 'hex') {
                    return rgbToHex(state.customColor);
                }

                return state.customColor;
            }
        };
    }
};
