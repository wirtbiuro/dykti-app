import styled from 'styled-components'

export const FormStyled = styled.div`
    input[type='text'],
    input[type='password'],
    input[type='submit'] {
        height: 50px;
        width: 100%;
        max-width: 400px;
    }
    input[type='checkbox'] {
        height: 20px;
        width: 20px;
    }
    input {
        margin-bottom: 30px;
        border-radius: 6px;
        border-color: rgba(0, 0, 0, 0.5);
        padding-left: 15px;
        margin-right: 10px;
    }
    .checkbox-styled {
        display: flex;
        align-items: center;
        margin-bottom: 30px;
        input {
            margin-bottom: 0px;
        }
    }
    select[multiple] {
        width: 300px;
    }
    .multiple-values {
        display: flex;
        max-width: 400px;
        margin-bottom: 10px;
        div {
            border-radius: 20px;
            background: #d9d9d9;
            padding: 2px 14px;
            margin-right: 10px;
        }
    }
`

export const OrderStyled = styled.div`
    padding: 15px;
    background: #cccccc;
    margin-bottom: 20px;
`

export const StepStyled = styled.div`
    padding: 15px;
    background: rgb(247, 247, 247);
    margin-bottom: 5px;
    button {
        margin-right: 10px;
        background: #635959;
        color: white;
        border: none;
        cursor: pointer;
    }
    .changes {
        height: 80vh;
        overflow: auto;
    }
    .changes-wrapper {
        margin-top: 20px;
    }
`

export const StepComponentStyled = styled.div`
    display: flex;
    flex-wrap: wrap;
    .prop {
        padding: 15px;
        padding-left: 0;
    }
    .description {
        font-size: 10px;
    }
    .value {
        font-size: bold;
    }
    .no-meeting-date {
        background-color: orange;
        color: white;
        width: 100%;
        padding-left: 10px;
    }
`

export const CreateFormStyled = styled.div`
    background: rgb(247, 247, 247);
    padding: 20px 10px;
`

export const HeaderStyled = styled.div`
    display: flex;
    justify-content: flex-end;
    button {
        color: white;
        margin-bottom: 20px;
        margin-left: 10px;
    }
`

export const AuthStyled = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.3);
    width: 100vw;
    height: 100vh;
    .close-auth {
        width: 100%;
        height: 100%;
    }
    .auth {
        margin: auto;
        position: relative;
        top: 20%;
        max-width: 300px;
        padding: 20px;
        background: white;
        form {
            display: flex;
            flex-direction: column;
        }
        input {
            height: 30px;
            width: 100%;
            margin-top: 10px;
        }
        .withErr {
            position: relative;
            display: flex;
        }
        .formError {
            position: absolute;
            top: 3px;
            left: 5px;
            height: 10px;
            color: red;
            font-size: 10px;
            z-index: 1;
            background-color: white;
        }
    }
`

export const MultiFormStyled = styled.div`
    .multi-selected {
        background: #1890ff;
        color: white;
    }
    .not-selected {
        background-color: white !important;
    }
    option::selection {
        background: white !important;
    }
`

export const CalendarStyled = styled.div`
    .calendar-main-panel {
        display: flex;
    }
    .calendar-view-time {
        margin-right: 5px;
    }
    select[name='minutes'] {
        margin-right: 10px;
    }
    .error {
        color: red;
    }
    margin-bottom: 30px;
`

export const ChangesStyled = styled.div`
    display: flex;
    gap: 56px;
    .date {
        min-width: 110px;
    }
    .change {
        display: flex;
        strong {
            margin-right: 6px;
        }
        p {
            margin-bottom: 9px;
        }
    }
    .col > p {
        margin-top: 9px;
    }
`

export const MainStyled = styled.div`
    .roles {
        display: flex;
        align-items: center;
        gap: 10px;
        justify-content: flex-end;
        flex-wrap: wrap;
        .role {
            list-style-type: none;
            cursor: pointer;
            border-radius: 6px;
            text-align: center;
            display: flex;
            align-items: center;

            padding: 0 10px;
            border: 1px solid black;
            background: rgba(0, 0, 0, 0.1);
            min-height: 30px;
        }
    }
`

export const CreatorFormPanelStyled = styled.div`
    .new-deal {
        color: white;
        margin-bottom: 20px;
        background: orange;
    }
    button {
        margin-right: 10px;
        color: white;
    }
`
