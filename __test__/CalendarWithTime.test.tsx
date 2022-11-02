import { describe, expect, test } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import CalendarWithTime from '../components/CalendarWithTime'
import { useCalendarData } from '../hooks/useCalendarData'

describe('CalendarWithTime', () => {
    test('should render component', () => {
        const CalendarWrapper = () => {
            const calendarData = useCalendarData()

            return (
                <CalendarWithTime
                    connection={calendarData}
                    isTimeEnabled={false}
                    defaultDate="2022-09-21T17:40:00.000Z"
                />
            )
        }

        render(<CalendarWrapper />)

        screen.debug()
    })
})
