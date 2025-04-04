# DALLEspace - AI Image Generator

DALLEspace is a web application that allows users to generate, edit, and manage AI-generated images using OpenAI's DALL-E API. It offers an intuitive interface for creating images from text prompts, enhancing prompts using GPT-4o, and saving generated images to a personal gallery.

## Features

- **Text Prompt Input**: Enter natural language descriptions to generate images
- **Prompt Enhancement**: Automatically improve prompts with GPT-4o for better results
- **Multi-language Support**: Toggle between English and Korean input
- **Image Generation**: Create high-quality images using DALL-E 3
- **Image Variations**: Generate variations based on existing images
- **Image Gallery**: Save and organize your generated images
- **Image Editing**: Make changes to existing images with text prompts
- **Download & Share**: Easily download your created images

## Technologies Used

- Next.js 15 (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- OpenAI API (DALL-E 3, GPT-4o)
- LocalStorage for image persistence

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dallespace.git
cd dallespace
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file by copying the example:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter a prompt describing the image you want to create
2. (Optional) Use the "Enhance Prompt" button to improve your prompt automatically
3. Select your desired image size and style
4. Click "Generate" to create your image
5. View, edit, download, or save the generated image
6. Access your saved images in the Gallery tab

## Future Enhancements

- Cloud storage integration with Firebase
- User authentication
- Advanced image editing with masks
- Voice-to-prompt functionality
- Style presets

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for the DALL-E and GPT APIs
- shadcn/ui for the component library
- Next.js team for the framework
#   d a l l e s p a c e  
 