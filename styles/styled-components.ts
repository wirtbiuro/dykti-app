import styled from 'styled-components'

export const FormStyled = styled.div`
    input[type='text'],
    input[type='password'],
    input[type='submit'] {
        height: 50px;
        width: 100%;
        max-width: 400px;
    }
    input[type='submit'] {
        cursor: pointer;
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
    select {
        margin-bottom: 20px;
    }
    .formError {
        color: orange;
        margin-bottom: 10px;
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
export const CreateFormStyled = styled.div`
    background: rgb(247, 247, 247);
    padding: 20px 10px;
`

export const HeaderStyled = styled.div`
    display: flex;
    justify-content: flex-end;
    max-width: 1700px;
    margin: auto;
    button {
        color: white;
        margin-bottom: 20px;
        margin-left: 10px;
    }
    .ant-spin-nested-loading > div > .ant-spin .ant-spin-dot {
        margin: -20px -6px;
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
        height: 100vh;
    }
    form {
        margin-bottom: 20px;
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

export const ChangesStyled = styled.div`
    display: flex;
    gap: 56px;
    .date {
        min-width: 110px;
    }
    .change {
        display: flex;
        margin-top: 9px;
        strong {
            margin-right: 6px;
        }
        &.error-change {
            color: red;
        }
    }
    .col {
        margin-bottom: 9px;
    }
    p {
        margin-bottom: 0;
    }
    .col.creator,
    .col.date {
        p {
            margin-top: 9px;
        }
    }
`

interface OtherRoleBtnStyledProps {
    isSelected: boolean
}

export const OtherRoleBtnStyled = styled.div<OtherRoleBtnStyledProps>`
    font-weight: ${(props) => (props.isSelected ? 'bold' : 'normal')};
    cursor: pointer;
`

export const MainStyled = styled.div`
    max-width: 1700px;
    margin: auto;
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
    .last-decision-quantity {
        background-color: orange;
        color: white;
        border-radius: 16px;
        margin-left: 6px;
        width: 22px;
        heigth: 22px;
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

interface CloseOrderStyledProps {
    isModalOpen: boolean
}

export const CloseOrderStyled = styled.div<CloseOrderStyledProps>`
    display: ${(props) => (props.isModalOpen ? 'block' : 'none')};
    margin-top: 20px;
    input {
        margin: 10px 0 20px 0;
    }
`

export const AllStyled = styled.div`
    padding: 20px;
    width: calc(100vw - 17px);
    height: 100vh;
    .centered {
        max-width: 1900px;
        margin: auto;
    }
`

export const StepComponentStyled = styled.div`
    .no-meeting-date {
        background-color: orange;
        color: white;
        width: 100%;
        padding-left: 10px;
    }
`

export const StepPropsStyled = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    .prop {
        padding: 5px 15px;
        padding-left: 0;
        max-width: 300px;
        &.unactive {
            color: rgba(0, 0, 0, 0.2);
        }
    }
    .description {
        font-size: 10px;
    }
    .value {
        font-size: bold;
    }
    .wrapper {
        display: flex;
        flex-direction: column;
    }
    .all-props {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
    }
    .all-prop {
        max-width: 200px;
    }
    .prop-title {
        font-weight: bold;
        margin-bottom: 20px;
        text-align: center;
    }
    button {
        height: 30px;
        margin: 5px 0;
    }
    .direction {
        padding-right: 10px;
        padding-top: 10px;
    }
`

export const PrevBranchPropStyled = styled.div`
    color: orange;
    font-size: 9px;
`

interface SendButtonsWrapperProps {
    visible: boolean
}

export const SendButtonsWrapper = styled.div<SendButtonsWrapperProps>`
    overflow: hidden;
    max-height: ${(props) => (props.visible ? 'auto' : '0px')};
`
