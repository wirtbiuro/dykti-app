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
    }
`

export const OrderStyled = styled.div`
    padding: 15px;
    background: #cccccc;
    margin-bottom: 20px;
`

export const StepStyled = styled.div`
    padding: 15px;
    background: #eeeeee;
    margin-bottom: 5px;
`

export const StepComponentStyled = styled.div`
    display: flex;
    flex-wrap: wrap;
    .prop {
        padding: 15px;
    }
    .description {
        font-size: 10px;
    }
    .value {
        font-size: bold;
    }
`

export const CreateFormStyled = styled.div`
    background: #eeeeee;
    padding: 20px;
`

export const HeaderStyled = styled.div`
    display: flex;
    justify-content: flex-end;
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
