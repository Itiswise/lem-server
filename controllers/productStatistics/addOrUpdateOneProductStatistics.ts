import { ProductStatistics } from "../../models/productStatistics";

interface IProductStatistics {
  givenHourlyRate?: number;
  suggestedHourlyRate?: number;
  givenTactTime?: number;
  suggestedTactTime?: number;
  automatic?: boolean;
  xlsxTactTime?: number;
  partNumber: string;
}

export const addOrUpdateOneProductStatistics = async function ({
  givenHourlyRate,
  suggestedHourlyRate,
  givenTactTime,
  suggestedTactTime,
  xlsxTactTime,
  automatic,
  partNumber,
}: IProductStatistics) {
  if (!partNumber) {
    throw new Error("You must provide part number!");
  }

  await ProductStatistics.findOne(
    { partNumber },
    function (err, existingProductStatistics) {
      if (err) {
        throw new Error(err);
      }

      if (!existingProductStatistics) {
        const productStatistics = new ProductStatistics({
          partNumber,
          xlsxTactTime,
        });

        productStatistics.save(function (err) {
          if (err) {
            throw new Error(err);
          }

          return {
            productStatistics,
          };
        });
      } else {
        if (automatic) {
          existingProductStatistics.automatic = automatic;
        }

        if (suggestedHourlyRate) {
          existingProductStatistics.suggestedHourlyRate = suggestedHourlyRate;
        }

        if (givenHourlyRate) {
          existingProductStatistics.givenHourlyRate = givenHourlyRate;
        }

        if (givenTactTime) {
          existingProductStatistics.givenTactTime = givenTactTime;
        }

        if (suggestedTactTime) {
          existingProductStatistics.suggestedTactTime = suggestedTactTime;
        }

        if (xlsxTactTime) {
          existingProductStatistics.xlsxTactTime = xlsxTactTime;
        }

        existingProductStatistics.save(function (err) {
          if (err) {
            throw new Error(err);
          }

          return {
            existingProductStatistics,
          };
        });
      }
    }
  );
};
