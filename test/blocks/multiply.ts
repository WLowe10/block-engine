type MulitplyProps = {
    num1: number;
    num2: number;
};

export const multiply = ({ num1, num2 }: MulitplyProps) => {
    const product = num1 + num2;

    console.log(`${num1} * ${num2} = ${product}`);

    return product;
};
