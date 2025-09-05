import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    header: ({ children, ...props }) => <header {...props}>{children}</header>,
    footer: ({ children, ...props }) => <footer {...props}>{children}</footer>,
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock embla-carousel-react
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [
    jest.fn(), // emblaRef
    {
      scrollPrev: jest.fn(),
      scrollNext: jest.fn(),
      canScrollPrev: jest.fn(() => true),
      canScrollNext: jest.fn(() => true),
      on: jest.fn(),
    },
  ],
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:7017'
