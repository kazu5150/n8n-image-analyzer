# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js frontend application for image analysis via n8n workflow. Users upload images which are analyzed by AI through n8n webhooks, with results displayed in the frontend.

## Development Commands

```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking (add script to package.json)
```

## Core Architecture

### Key Components to Implement
- **Image Upload Component**: Handles drag-and-drop and file selection with preview
- **File Validation**: Enforces 5MB limit and PNG/JPEG/GIF formats only  
- **n8n Integration**: Sends images via multipart/form-data POST to n8n webhook
- **Results Display**: Shows AI analysis results with error handling
- **Loading States**: Visual feedback during upload and analysis

### API Integration
- **Endpoint**: n8n webhook (URL to be configured)
- **Method**: HTTP POST with multipart/form-data
- **Response**: AI analysis text result
- **Error Handling**: Network errors and AI service failures

## Technical Specifications

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **File Upload**: react-dropzone for enhanced UX
- **HTTP Client**: fetch API
- **File Limits**: 5MB max, PNG/JPEG/GIF only
- **Deployment**: Vercel or Netlify (Next.js optimized)

## Security Considerations

- Never expose API keys in frontend code
- n8n handles AI service authentication
- Configure CORS on n8n side for frontend origin
- Validate file types and sizes client-side and server-side

## MVP Scope

Focus on core functionality first:
1. Image upload with drag-and-drop
2. File validation and preview  
3. n8n webhook integration
4. Results display with loading states
5. Basic error handling

Defer advanced features like user auth, history, and batch processing for future iterations.