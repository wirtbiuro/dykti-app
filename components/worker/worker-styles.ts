import styled from 'styled-components'

const cellWidth = 24
const nameWidth = 200

export const WorkersStyled = styled.div`
    padding: 20px 0;
`

export const WorkerStyled = styled.div`
    display: flex;
    .cells {
        display: flex;
    }
    .name {
        width: ${nameWidth}px;
        border: 1px solid #cccccc;
        padding-left: 10px;
    }
`
interface WorkerOrderStyledProps {
    freeDays: number
    orderId: number
}

export const WorkerOrderStyled = styled.div<WorkerOrderStyledProps>`
    display: flex;
    .freedays {
        display: flex;
        margin-left: ${(props) => (props.freeDays < 0 ? props.freeDays * cellWidth + 'px' : 0)};
    }
    .workdays {
        display: flex;
        position: relative;
    }
    .freeday,
    .workday,
    .mixedday {
        width: ${cellWidth}px;
        height: ${cellWidth}px;
        border: 1px solid #cccccc;
        background-color: white;
    }
    .mixedday {
        background-color: hsla(${(props) => 80 * (props.orderId - 0.5)}, 100%, 50%, 0.5);
        z-index: 1;
    }
    .workday {
        background-color: hsla(${(props) => 80 * props.orderId}, 100%, 50%, 0.5);
    }
    .hint {
        position: absolute;
        top: -${cellWidth + 5}px;
        left: 5px;
        padding: 2px;
        border: 1px solid #bbbbbb;
        background-color: white;
        z-index: 2;
    }
`

export const DaysStyled = styled.div`
    display: flex;
    .day {
        min-width: ${cellWidth}px;
        border: 1px solid #cccccc;
        background-color: white;
        display: flex;
        justify-content: center;
    }
    .name {
        min-width: ${nameWidth}px;
        border: 1px solid #cccccc;
        text-align: right;
        padding-right: 10px;
    }
`

export const MonthsStyled = styled.div`
    display: flex;
    .name {
        min-width: ${nameWidth}px;
        border: 1px solid #cccccc;
        text-align: right;
        padding-right: 10px;
    }
`

interface MonthStyledProps {
    days: number
}

export const MonthStyled = styled.div<MonthStyledProps>`
    min-width: ${(props) => props.days * cellWidth + 'px'};
    text-align: center;
    border: 1px solid #cccccc;
`
