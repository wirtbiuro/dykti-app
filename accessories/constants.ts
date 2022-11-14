import { StepType } from '../types'

export const week = {
    pl: ['pon', 'wto', 'śro', 'czw', 'pią', 'sob', 'nie'],
    ua: ['пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт', 'ндл'],
    en: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
}

export const monthNames = {
    pl: [
        'Styczeń',
        'Luty',
        'Marzec',
        'Kwiecień',
        'Maj',
        'Czerwiec',
        'Lipiec',
        'Sierpień',
        'Wrzesień',
        'Październik',
        'Listopad',
        'Grudzień',
    ],
    ua: [
        'Січень',
        'Лютий',
        'Березень',
        'Квітень',
        'Травень',
        'Червень',
        'Липень',
        'Серпень',
        'Вересень',
        'Жовтень',
        'Листопад',
        'Грудень',
    ],
    en: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
}

type FieldnamesKeysType = Omit<StepType, 'stepCreatorId'>

export const fieldNames: Record<keyof FieldnamesKeysType, string> = {
    passedTo: 'Przeniesiony do',
    returnStep: 'Krok powrotny',
    beffaringStepComment: 'Komentarz Befaringowca',
    beffaringStepDocsSendDate: 'Kiedy Befaringowiec wysłał dokumenty',
    beffaringStepOfferDate: 'Kiedy przygotować ofertę',
    beffaringStepWasThereMeeting: 'Odbyło się spotkanie Befaringowca z klientem',
    contractCheckerStepComments: 'Komentarz weryfikatora kontraktu',
    contractCheckerStepIsContractChecked: 'Kontrakt zweryfikowan',
    contractCheckerStepWorkEndDate: 'Przybliżona data rozpoczęcia pracy',
    contractCheckerStepWorkStartDate: 'Przybliżona data zakończenia pracy',
    contractCreatorStepContractRejectionReason: 'Powód niepodpisania kontraktu',
    contractCreatorStepContractSendingDate: 'Data wysłania kontraktu',
    contractCreatorStepIsContractAccepted: 'Kontrakt podpisan',
    contractStepAreOfferChanges: 'Oferta potrzebuje zmian',
    contractStepIsOfferAccepted: 'Klient przyjął ofertę',
    contractStepOfferChangesComment: 'Zmiany w ofercie',
    contractStepOfferRejectionReason: 'Przyczyna odrzucenia oferty',
    contractStepOfferSendingDate: 'Data wysłania oferty',
    contractStepSentForVerificationDate: 'Data wysłania kontraktu do weryfikacji',
    createdAt: 'Data',
    createdBy: 'Kto stworzył',
    createdByStep: 'Krok',
    stepCreator: 'Kto stworzył',
    formStepAddress: 'Adres',
    formStepCity: 'Miasto',
    formStepClientName: 'Imię',
    formStepComment: 'Komentarz twórcy formularza',
    formStepEmail: 'E-mail',
    formStepMeetingDate: 'Data spotkania Befaringowca z klientem',
    formStepPhone: 'Numer kontaktowy',
    formStepWhereClientFound: 'Gdzie znaleziono klienta',
    id: 'id',
    orderId: 'id zamówienia',
    isCompleted: 'Sprawa zakończona',
    maxPromotion: 'Maksymalny krok',
    // lastUpdateStep: 'Krok aktualizacji',
    offerStepAreBefDocsGood: 'Dokumenty od Befaring Mana są w porządku',
    offerStepBefComments: 'Komentarz do Befaringowca',
    offerStepComment: 'Komentarz twórcy oferty',
    offerStepOfferDate: 'Data utworzenia oferty',
    questionnaireStepArePaymentsReceived: 'Wpłyneły wszystkie płatności',
    questionnaireStepDissatisfaction: 'Przyczyna niezadowolenia klienta',
    questionnaireStepHaveClientReceviedDocs: 'Klient otrzymał dokumentację',
    questionnaireStepIsAcceptanceReport: 'Protokół odbioru',
    questionnaireStepIsClientSatisfied: 'Klient jest zadowolony',
    questionnaireStepOtherDissatisfaction: 'Inna przyczyna niezadowolenia klienta',
    questionnaireStepOtherSatisfaction: 'Inna przyczyna zadowolenia klienta',
    questionnaireStepSatisfaction: 'Przyczyna zadowolenia klienta',
    referenceStepIsClientReference: 'Klient wystawil referencje',
    referenceStepReferenceLocation: 'Gdzie wysłano referencję',
    referenceStepWasSentRequest: 'Prośba o referencję do klienta jest wysłana',
    shouldConfirmView: 'Akceptacja potwierdzona',
    workStepContractEdits: 'Zmiany w kontrakcie',
    workStepTeam: 'Ekipa',
    workStepWorkEndDate: 'Data rozpoczęcia pracy',
    workStepWorkStartDate: 'Data zakończenia pracy',
}

export const selectData = {
    formStepWhereClientFound: [
        ['select', 'Wybierz'],
        ['mittanbud', 'Mittanbud'],
        ['google', 'Google'],
        ['polecenie', 'Polecenie'],
        ['samochod', 'Reklama na samochodzie'],
        ['other', 'Inne'],
    ],
    workStepTeam: [
        ['1', 'Piotr'],
        ['22', 'Adam'],
        ['3', 'Kamil'],
        ['4', 'Olek'],
    ],
    questionnaireStepSatisfaction: [
        ['timeFrame', 'Ramy czasowe'],
        ['endDate', 'Data zakonczenia'],
        ['other', 'Inne'],
    ],
    questionnaireStepDissatisfaction: [
        ['timeFrame', 'Ramy czasowe'],
        ['endDate', 'Data zakonczenia'],
        ['other', 'Inne'],
    ],
    referenceStepReferenceLocation: [
        ['mittanbud', 'Mittanbud'],
        ['google', 'Google'],
        ['site', 'Strona internetowa'],
    ],
    contractStepOfferRejectionReason: [
        ['select', 'Wybierz powód odrzucenia oferty'],
        ['price', 'Wysoka cena'],
        ['data', 'Termin'],
        ['other', 'Inny'],
    ],
}
