import styled from 'styled-components'

export const CalendarStyled = styled.div`
    .calendar-main-panel {
        display: flex;
    }
    .calendar-view-time {
        margin-right: 5px;
    }
    select[name='minutes'],
    select[name='hours'] {
        margin-right: 0px;
        margin-bottom: 0;
    }
    .error {
        color: red;
    }
    .date {
        margin-right: 0px;
        cursor: context-menu;
        border: 1px solid black;
        background: white;
        padding: 1px 4px;
        border-radius: 2px;
    }
    .date.date-disabled {
        margin-right: 6px;
        cursor: context-menu;
        border: none;
        background: transparent;
        padding: 0;
        border-radius: none;
    }
    button {
        margin-left: 5px;
    }
    margin-bottom: 30px;
`
