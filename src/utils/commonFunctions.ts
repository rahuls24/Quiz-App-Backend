export function createLookupArrayForElementPresence(array: Array<string | number>) {
	return (element: number | string) => array.includes(element);
}
export function createLookupArrayForElementAbsence(array: Array<string | number>){
    const isElementPresentInLookUpArray = createLookupArrayForElementPresence(array);
    return (element: number | string) => !isElementPresentInLookUpArray(element)
}