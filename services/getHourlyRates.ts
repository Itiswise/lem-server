import { OrderDoc } from "../models/order";
import { LineDoc } from "../models/line";
import { getValidScans } from "./getValidScans";
import { renderTime } from "./renderTime";
import { getDateWithHour } from "./getDateWithHour";
import { getLineDescription } from "./getLineDescription";
import { Operator as OperatorModel } from "../models/operator";
import {ValidOperators, operatorsAttr} from "./operatorsConfig";

const getPositionLabel = (position: number): string => {
    return `Stanowisko ${position}`;
};

const formatOperators = async (operators: ValidOperators | undefined): Promise<string> => {
    if (!operators) return "No operators";

    const operatorDetails = await Promise.all(
        operators.map(async (operator: operatorsAttr) => {
            const operatorData = await OperatorModel.findById(operator.operator).exec();
            if (!operatorData) {
                return `[${getPositionLabel(operator.position)}]: Unknown Operator (No details found)`;
            }

            return `[${getPositionLabel(operator.position)}]: ${
                operatorData.firstname || "Unknown"
            } ${operatorData.lastname || "Unknown"} (${operatorData.identifier || "No identifier"})`;
        })
    );

    return operatorDetails.join("\n\n");
};

const groupBy = (items: any[], key: string): Record<string, any[]> => {
    return items.reduce((result: Record<string, any[]>, item: any) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
};

export const getHourlyRates = async (order: OrderDoc, lines: LineDoc[]): Promise<any[]> => {
    const { scans } = order;

    const validScans = getValidScans(scans);

    const scansWithDateHour = await Promise.all(
        validScans.map(async (scan) => {
            const formattedOperators = await formatOperators(scan.operators);
            const withOperators = formattedOperators ? "\n\n" +
                formattedOperators + "\n\n" : "\n\n";
            return {
                dateHour: getDateWithHour(scan.timeStamp),
                timeStamp:
                    scan.scanContent +
                    " - - - " +
                    renderTime(scan.timeStamp) + withOperators,
                scansLine: scan._line,
            };
        })
    );

    const scansGrouppedByDateHour = groupBy(scansWithDateHour, "dateHour");

    const hourlyRates = Object.entries(scansGrouppedByDateHour).map(
        ([dateHour, groupedScans]) => {
            const scansGrouppedByLine = groupBy(groupedScans, "scansLine");

            const scanDetails = Object.entries(scansGrouppedByLine).map(
                ([lineKey, scanList]) => ({
                    scansLine: getLineDescription(lineKey, lines),
                    scansSum: scanList.length,
                    scansTimestamps: scanList.map((scan) => scan.timeStamp).reverse(),
                })
            );

            return {
                dateHour,
                scanDetails,
            };
        }
    );

    return hourlyRates.reverse();
};
