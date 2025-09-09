/**
 * Frontend component tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MoodSelector } from '../components/MoodSelector'
import { TimeSlider } from '../components/TimeSlider'
import { ToggleInterest } from '../components/ToggleInterest'
import { CardItem } from '../components/CardItem'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import type { PlaylistItem } from '../lib/types'

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('MoodSelector Component', () => {
  const mockOnMoodChange = jest.fn()

  beforeEach(() => {
    mockOnMoodChange.mockClear()
  })

  it('renders all mood options', () => {
    render(
      <MoodSelector selectedMood="happy" onMoodChange={mockOnMoodChange} />
    )

    expect(screen.getByText('Energized')).toBeInTheDocument()
    expect(screen.getByText('Calm')).toBeInTheDocument()
    expect(screen.getByText('Stressed')).toBeInTheDocument()
    expect(screen.getByText('Happy')).toBeInTheDocument()
    expect(screen.getByText('Tired')).toBeInTheDocument()
  })

  it('shows selected mood as active', () => {
    render(
      <MoodSelector selectedMood="energized" onMoodChange={mockOnMoodChange} />
    )

    const energizedButton = screen.getByRole('button', { name: /energized/i })
    expect(energizedButton).toHaveClass('mood-button-active')
  })

  it('calls onMoodChange when mood is selected', async () => {
    const user = userEvent.setup()
    render(
      <MoodSelector selectedMood="happy" onMoodChange={mockOnMoodChange} />
    )

    const calmButton = screen.getByRole('button', { name: /calm/i })
    await user.click(calmButton)

    expect(mockOnMoodChange).toHaveBeenCalledWith('calm')
  })

  it('disables interaction when disabled prop is true', () => {
    render(
      <MoodSelector 
        selectedMood="happy" 
        onMoodChange={mockOnMoodChange} 
        disabled={true}
      />
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })
})

describe('TimeSlider Component', () => {
  const mockOnTimeChange = jest.fn()

  beforeEach(() => {
    mockOnTimeChange.mockClear()
  })

  it('renders all time options', () => {
    render(
      <TimeSlider selectedTime={30} onTimeChange={mockOnTimeChange} />
    )

    expect(screen.getByText('5 min')).toBeInTheDocument()
    expect(screen.getByText('10 min')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
    expect(screen.getByText('1 hour')).toBeInTheDocument()
    expect(screen.getByText('2 hours')).toBeInTheDocument()
  })

  it('shows selected time as active', () => {
    render(
      <TimeSlider selectedTime={60} onTimeChange={mockOnTimeChange} />
    )

    const hourButton = screen.getByRole('button', { name: /1 hour/i })
    expect(hourButton).toHaveClass('bg-primary')
  })

  it('calls onTimeChange when time is selected', async () => {
    const user = userEvent.setup()
    render(
      <TimeSlider selectedTime={30} onTimeChange={mockOnTimeChange} />
    )

    const tenMinButton = screen.getByRole('button', { name: /10 min/i })
    await user.click(tenMinButton)

    expect(mockOnTimeChange).toHaveBeenCalledWith(10)
  })
})

describe('ToggleInterest Component', () => {
  const mockOnInterestsChange = jest.fn()

  beforeEach(() => {
    mockOnInterestsChange.mockClear()
  })

  it('renders interest options', () => {
    render(
      <ToggleInterest 
        selectedInterests={['lifestyle']} 
        onInterestsChange={mockOnInterestsChange} 
      />
    )

    expect(screen.getByText('Lifestyle')).toBeInTheDocument()
    expect(screen.getByText('Learning')).toBeInTheDocument()
  })

  it('shows selected interests as active', () => {
    render(
      <ToggleInterest 
        selectedInterests={['lifestyle', 'learning']} 
        onInterestsChange={mockOnInterestsChange} 
      />
    )

    const lifestyleButton = screen.getByRole('button', { name: /lifestyle/i })
    const learningButton = screen.getByRole('button', { name: /learning/i })
    
    expect(lifestyleButton).toHaveClass('interest-chip-active')
    expect(learningButton).toHaveClass('interest-chip-active')
  })

  it('adds interest when unselected interest is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ToggleInterest 
        selectedInterests={['lifestyle']} 
        onInterestsChange={mockOnInterestsChange} 
      />
    )

    const learningButton = screen.getByRole('button', { name: /learning/i })
    await user.click(learningButton)

    expect(mockOnInterestsChange).toHaveBeenCalledWith(['lifestyle', 'learning'])
  })

  it('prevents removing the last interest', async () => {
    const user = userEvent.setup()
    render(
      <ToggleInterest 
        selectedInterests={['lifestyle']} 
        onInterestsChange={mockOnInterestsChange} 
      />
    )

    const lifestyleButton = screen.getByRole('button', { name: /lifestyle/i })
    await user.click(lifestyleButton)

    // Should not call onInterestsChange when trying to remove the last interest
    expect(mockOnInterestsChange).not.toHaveBeenCalled()
  })
})

describe('CardItem Component', () => {
  const mockItem: PlaylistItem = {
    domain: 'workout',
    id: '1',
    item_id: 'workout_1',
    title: 'Morning HIIT Blast',
    duration_min: 15,
    tags: ['hiit', 'cardio', 'intense'],
    mood_match: ['energized'],
    image: '/images/workouts/hiit.jpg',
    score: 0.87,
    difficulty: 'intermediate',
    description: 'High-intensity interval training to kickstart your day',
    score_breakdown: {
      overall: 0.87,
      content: 0.85,
      collaborative: 0.90,
      mood: 0.88,
      time: 0.85,
    },
  }

  const mockOnLike = jest.fn()
  const mockOnDislike = jest.fn()

  beforeEach(() => {
    mockOnLike.mockClear()
    mockOnDislike.mockClear()
  })

  it('renders card item with correct information', () => {
    render(
      <CardItem 
        item={mockItem} 
        onLike={mockOnLike} 
        onDislike={mockOnDislike} 
      />
    )

    expect(screen.getByText('Morning HIIT Blast')).toBeInTheDocument()
    expect(screen.getByText('15m')).toBeInTheDocument()
    expect(screen.getByText('87%')).toBeInTheDocument()
    expect(screen.getByText('intermediate')).toBeInTheDocument()
    expect(screen.getByText('#hiit')).toBeInTheDocument()
  })

  it('calls onLike when like button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CardItem 
        item={mockItem} 
        onLike={mockOnLike} 
        onDislike={mockOnDislike} 
      />
    )

    const likeButton = screen.getByRole('button', { name: /like/i })
    await user.click(likeButton)

    expect(mockOnLike).toHaveBeenCalledWith('workout_1')
  })

  it('calls onDislike when dislike button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CardItem 
        item={mockItem} 
        onLike={mockOnLike} 
        onDislike={mockOnDislike} 
      />
    )

    const dislikeButton = screen.getByRole('button', { name: /pass/i })
    await user.click(dislikeButton)

    expect(mockOnDislike).toHaveBeenCalledWith('workout_1')
  })

  it('hides feedback buttons when showFeedback is false', () => {
    render(
      <CardItem 
        item={mockItem} 
        onLike={mockOnLike} 
        onDislike={mockOnDislike} 
        showFeedback={false}
      />
    )

    expect(screen.queryByRole('button', { name: /like/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /pass/i })).not.toBeInTheDocument()
  })
})

describe('Header Component', () => {
  it('renders header with title and tagline', () => {
    render(<Header />)

    expect(screen.getByText(/Smart Lifestyle/)).toBeInTheDocument()
    expect(screen.getByText(/Learning/)).toBeInTheDocument()
    expect(screen.getByText(/Discover personalized workouts/)).toBeInTheDocument()
  })

  it('renders feature highlights', () => {
    render(<Header />)

    expect(screen.getByText('AI-Powered')).toBeInTheDocument()
    expect(screen.getByText('Mood-Based')).toBeInTheDocument()
    expect(screen.getByText('Personalized')).toBeInTheDocument()
  })
})

describe('Footer Component', () => {
  it('renders footer with brand and links', () => {
    render(<Footer />)

    expect(screen.getByText('Smart LLR')).toBeInTheDocument()
    expect(screen.getByText(/Made with/)).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
  })

  it('renders current year in copyright', () => {
    render(<Footer />)
    
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
  })

  it('renders system status', () => {
    render(<Footer />)

    expect(screen.getByText('System Online')).toBeInTheDocument()
    expect(screen.getByText('Version 1.0.0')).toBeInTheDocument()
  })
})
