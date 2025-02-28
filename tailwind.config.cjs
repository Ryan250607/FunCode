/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6610f5', // 默认主题色
                    50: '#e6e0ff', // 极浅紫色（可选，用于渐变或hover）
                    100: '#c4b5fd',
                    200: '#a288fa',
                    300: '#7f5af8',
                    400: '#6610f5', // 主色
                    500: '#5a0dd8',
                    600: '#4e0bbb',
                    700: '#41099e',
                    800: '#350781',
                    900: '#280567',
                },
            },
            backgroundImage: {
            }
        },
    },
    plugins: [
        function ({ addBase }) {
            addBase({
                
            });
        },
    ],
};
